import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Check, ArrowLeft } from "lucide-react";
import type { ResumeData } from "@shared/schema";
import { degreesByStream } from "@/data/resumeData";

interface DegreeSelectionProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DegreeSelection({ data, updateData, onNext, onBack }: DegreeSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const degrees = degreesByStream[data.stream] || [];
  const filteredDegrees = degrees.filter(degree =>
    degree.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDegree = degrees.find(d => d.name === data.degree);

  const handleDegreeSelect = (degreeName: string) => {
    updateData({ degree: degreeName, specialization: "" });
  };

  const handleSpecializationSelect = (specialization: string) => {
    updateData({ specialization });
    setTimeout(() => onNext(), 300);
  };

  const handleChangeDegree = () => {
    updateData({ degree: "", specialization: "" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-testid="button-back"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">
          {selectedDegree ? 'Choose Your Specialization' : 'Select Your Degree'}
        </h2>
        <p className="text-muted-foreground">
          {selectedDegree 
            ? `Pick your ${selectedDegree.name} specialization`
            : 'What degree program did you complete?'}
        </p>
      </div>

      {!selectedDegree ? (
        <>
          <div className="max-w-md mx-auto">
            <Label htmlFor="degree-search" className="sr-only">Search degrees</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="degree-search"
                placeholder="Search for your degree..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-degree-search"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDegrees.map((degree, index) => (
              <Card
                key={degree.name}
                className="p-4 cursor-pointer transition-all hover-elevate hover:border-primary/50"
                onClick={() => handleDegreeSelect(degree.name)}
                data-testid={`card-degree-${degree.name.replace(/[^a-zA-Z]/g, '')}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{degree.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {degree.specializations.length} specializations available
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {filteredDegrees.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No degrees found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangeDegree}
              data-testid="button-change-degree"
            >
              Change Degree ({selectedDegree.name})
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDegree.specializations.map((spec, index) => (
              <Card
                key={spec}
                className={`p-4 cursor-pointer transition-all hover-elevate ${
                  data.specialization === spec
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleSpecializationSelect(spec)}
                data-testid={`card-specialization-${spec.replace(/[^a-zA-Z]/g, '')}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{spec}</h3>
                  {data.specialization === spec && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
