"use client";

import { useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "../ui/label";

interface Props {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  label?: string;
  labelSearch?: string;
  disabled?: boolean;
  className?: string;
  options?: { value: string; label: string }[] | undefined;
  apiEndpoint?: string;
  searchKey?: string; // Key to search in API response
  minSearchLength?: number;
}

interface ApiOption {
  value: string;
  label: string;
  [key: string]: any;
}

export default function SelectAutoCompleteCustom({
  value,
  onChange,
  placeholder,
  label,
  labelSearch = "",
  disabled,
  className,
  options,
  apiEndpoint,
  searchKey = "name",
  minSearchLength = 2
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commandRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce function for API calls
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // API search function
  const searchAPI = async (query: string) => {
    if (!apiEndpoint || query.length < minSearchLength) {
      setApiOptions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}?search=${encodeURIComponent(query)}&limit=10`);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      // Transform API response to options format
      const optionsArray = Array.isArray(data) ? data : data.results || data.data || [];
      const formattedOptions = optionsArray.map((item: any) => ({
        value: item.id || item.value || item[searchKey],
        label: item.name || item.label || item[searchKey] || item.title,
        ...item // Keep original data
      }));

      setApiOptions(formattedOptions);
    } catch (err) {
      setError('Failed to search data');
      setApiOptions([]);
      console.error('API search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(searchAPI, 1000),
    [apiEndpoint, searchKey, minSearchLength]
  );

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (apiEndpoint) {
      debouncedSearch(query);
    }
  };

  // Get current options (static or API)
  const currentOptions = apiEndpoint ? apiOptions : options || [];

  // Filter static options if no API endpoint
  const filteredOptions = !apiEndpoint && searchQuery
    ? currentOptions.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : currentOptions;

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
      // Focus the CommandInput when opening the dropdown
      if (!isOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleSelect = (data: string) => {
    onChange?.(data);
    setIsOpen(false);
    setSearchQuery("");
    if (apiEndpoint) {
      setApiOptions([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        if (apiEndpoint) {
          setApiOptions([]);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, apiEndpoint]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
        if (apiEndpoint) {
          setApiOptions([]);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, apiEndpoint]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-white block mb-2">
          {label}
        </label>
      )}
      <Button
        ref={buttonRef}
        variant="outline"
        role="combobox"
        onClick={toggle}
        aria-expanded={isOpen}
        className={`w-full py-6 bg-[#1A2535] active:border-[#1A2535] focus:border-[#1A2535] focus:text-gray-200 hover:text-gray-200 hover:border-gray-500 hover:bg-[#1A2535] justify-between font-normal rounded-md border-gray-500 text-gray-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {value
          ? (currentOptions.find((option) => option.value === value)?.label || value)
          : (<span className="text-gray-500">{placeholder || "Select an option"}</span>)}
        <ChevronDown className="ml-2 h-5 w-5 shrink-0 text-white" />
      </Button>

      {isOpen && (
        <div
          ref={commandRef}
          className="absolute bg-[#1A2534] z-100 mt-1 w-full text-white border border-gray-600 text-white rounded-md shadow-lg max-h-60 overflow-hidden"
        >
          <Command shouldFilter={false} className="bg-[#1A2534] border-gray-600"> {/* Disable built-in filtering */}
            <Label className="text-sm font-bold text-white block px-3 py-3">{labelSearch}</Label>
            <div className="relative mt-2">
              <CommandInput
                ref={inputRef}
                value={searchQuery}
                onValueChange={handleSearchChange}
                placeholder={`Cari ${labelSearch}` || "Search..."}
                className="border bg-[#1A2534] text-white border-gray-600 mb-5 p-2 pl-3 rounded-md focus:border-gray-400"
              />
              {isLoading ? (
                <Loader2 className="absolute right-3 -top-6 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              ) : ''}
            </div>

            <CommandList className="border-none px-2 py-2">
              {error ? (
                <div className="px-2 py-4 text-sm text-red-500 text-center">
                  {error}
                </div>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty className="text-gray-500 text-center text-sm pb-3">
                  {isLoading ? "Searching..." : (
                    apiEndpoint && searchQuery.length < minSearchLength
                      ? `Type at least ${minSearchLength} characters to search`
                      : "No results found."
                  )}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        handleSelect(currentValue)
                      }}
                      className="cursor-pointer text-white data-[selected=true]:text-gray-700 focus:text-gray-700 py-2 rounded-lg px-2 hover:text-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full hover:text-gray-700">
                        <span>{option.label}</span>
                        <Check
                          className={cn(
                            "h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}