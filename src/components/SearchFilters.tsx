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
          placeholder="Search programs (e.g. UX Design, Medical Assistant)..."
          className="flex-1"
          onChange={(e) => onSearch(e.target.value)}
        />
        <Button className="bg-primary hover:bg-primary/90">Search</Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <Select onValueChange={(value) => onFilterChange("enrollment", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Enrollment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullTime">Full Time</SelectItem>
            <SelectItem value="partTime">Part Time</SelectItem>
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

        <Select onValueChange={(value) => onFilterChange("country", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="jp">Japan</SelectItem>
            <SelectItem value="cn">China</SelectItem>
            <SelectItem value="in">India</SelectItem>
            {/* Add more countries as needed */}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterChange("cost", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Cost Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="under5k">Under $5,000</SelectItem>
            <SelectItem value="5kTo15k">$5,000 - $15,000</SelectItem>
            <SelectItem value="15kTo30k">$15,000 - $30,000</SelectItem>
            <SelectItem value="over30k">Over $30,000</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterChange("attendance", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Attendance Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="physical">Physical (On Campus)</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="digital">Digital (Online)</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterChange("certificateType", value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Certificate Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="degree">Degree</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
            <SelectItem value="professional">Professional Certification</SelectItem>
            <SelectItem value="microcredential">Microcredential</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};