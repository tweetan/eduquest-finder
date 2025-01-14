import { useState } from "react";
import { SearchFilters } from "@/components/SearchFilters";
import { InstitutionCard } from "@/components/InstitutionCard";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { searchPrograms } from "@/services/educationApi";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['programs', searchQuery],
    queryFn: () => searchPrograms(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length > 2) {
      toast({
        title: "Searching Programs",
        description: `Looking for institutions offering "${query}" programs...`,
      });
    }
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
            Search for educational programs worldwide. Enter keywords like "UX Design" or "Medical Assistant" to find institutions offering these programs.
          </p>
        </div>

        <SearchFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />

        {isLoading ? (
          <div className="text-center py-8">Loading programs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((institution, index) => (
              <InstitutionCard key={index} institution={institution} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;