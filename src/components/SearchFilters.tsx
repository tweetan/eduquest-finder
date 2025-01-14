import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string, value: string) => void;
}

export const SearchFilters = ({ onSearch, onFilterChange }: SearchFiltersProps) => {
  return (
    <div className="w-full space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search institutions..."
          className="flex-1"
          onChange={(e) => onSearch(e.target.value)}
        />
        <Button className="bg-primary hover:bg-primary/90">Search</Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Select onValueChange={(value) => onFilterChange("type", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Institution Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="university">University</SelectItem>
            <SelectItem value="college">College</SelectItem>
            <SelectItem value="institute">Technical Institute</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterChange("level", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Program Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undergraduate">Undergraduate</SelectItem>
            <SelectItem value="graduate">Graduate</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterChange("region", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="northAmerica">North America</SelectItem>
            <SelectItem value="europe">Europe</SelectItem>
            <SelectItem value="asia">Asia</SelectItem>
            <SelectItem value="africa">Africa</SelectItem>
            <SelectItem value="southAmerica">South America</SelectItem>
            <SelectItem value="oceania">Oceania</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};