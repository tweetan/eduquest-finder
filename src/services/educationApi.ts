const SCORECARD_API_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const API_KEY = 'demo_key'; // Replace with your API key from https://api.data.gov/signup/

interface Program {
  name: string;
  type: string;
  level: string;
}

interface Institution {
  name: string;
  type: string;
  location: string;
  programs: string[];
}

export const searchPrograms = async (query: string): Promise<Institution[]> => {
  try {
    const response = await fetch(
      `${SCORECARD_API_BASE}?api_key=${API_KEY}&school.programs.cip_4_digit.title=${encodeURIComponent(query)}&fields=school.name,school.city,school.state,school.school_url,latest.programs.cip_4_digit`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    
    return data.results.map((result: any) => ({
      name: result['school.name'],
      type: 'University', // The API doesn't provide a specific type
      location: `${result['school.city']}, ${result['school.state']}`,
      programs: result['latest.programs.cip_4_digit']
        ?.map((program: any) => program.title)
        .filter((title: string) => 
          title.toLowerCase().includes(query.toLowerCase())
        ) || []
    }));
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};