import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, MapPin } from "lucide-react";

interface Institution {
  name: string;
  type: string;
  location: string;
  programs: string[];
}

export const InstitutionCard = ({ institution }: { institution: Institution }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="text-xl font-bold">{institution.name}</span>
          <Badge variant="secondary" className="ml-2">
            {institution.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{institution.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <GraduationCap className="h-4 w-4" />
          <div className="flex flex-wrap gap-2">
            {institution.programs.map((program) => (
              <Badge key={program} variant="outline">
                {program}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};