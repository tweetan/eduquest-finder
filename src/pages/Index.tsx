import { useState } from "react";
import { SearchFilters } from "@/components/SearchFilters";
import { InstitutionCard } from "@/components/InstitutionCard";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockInstitutions = [
  {
    name: "Global University",
    type: "University",
    location: "New York, USA",
    programs: ["Computer Science", "Business", "Engineering"],
  },
  {
    name: "European Institute of Technology",
    type: "Institute",
    location: "Paris, France",
    programs: ["Data Science", "AI", "Robotics"],
  },
  {
    name: "Pacific College",
    type: "College",
    location: "Sydney, Australia",
    programs: ["Arts", "Design", "Media"],
  },
];

const Index = () => {
  const [searchResults, setSearchResults] = useState(mockInstitutions);
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    // In a real app, this would be an API call
    const filtered = mockInstitutions.filter((institution) =>
      institution.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    
    toast({
      title: "Search Results Updated",
      description: `Found ${filtered.length} institutions matching your criteria`,
    });
  };

  const handleFilterChange = (filter: string, value: string) => {
    // In a real app, this would be combined with the search query
    console.log(`Filter ${filter} changed to ${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Education Finder</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect educational institution worldwide. Search through universities,
            colleges, and institutes based on your preferences.
          </p>
        </div>

        <SearchFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((institution, index) => (
            <InstitutionCard key={index} institution={institution} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;