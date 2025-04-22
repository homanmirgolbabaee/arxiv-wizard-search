import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface QuizQuestion {
  title: string;
  question: string;
  options: string[];
  answer: string;
}

interface FlashCardProps {
  questions: QuizQuestion[];
}

const FlashCard: React.FC<FlashCardProps> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  if (!questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="p-6 text-center">
          No questions available
        </CardContent>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentIndex];
  
  const handlePrevious = () => {
    setFlipped(false);
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev === 0 ? questions.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setFlipped(false);
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev === questions.length - 1 ? 0 : prev + 1));
  };
  
  const toggleFlip = () => {
    setFlipped(!flipped);
  };
  
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    // Auto-flip the card after selecting an option
    setFlipped(true);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <Button variant="ghost" size="sm" onClick={toggleFlip}>
          <RotateCw className="h-4 w-4 mr-1" />
          Flip Card
        </Button>
      </div>
      
      <Card 
        className="w-full max-w-xl mx-auto shadow-md transition-all duration-200"
      >
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-medium text-center">
            {currentQuestion.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="min-h-[250px] p-6 flex flex-col justify-center">
          {!flipped ? (
            <div className="space-y-6">
              <p className="text-lg font-medium text-center mb-6">{currentQuestion.question}</p>
              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={selectedOption === option ? "default" : "outline"}
                    className="justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleSelectOption(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Answer:</h3>
              <p className="text-xl font-bold">{currentQuestion.answer}</p>
              {selectedOption && (
                <div className="mt-4 p-3 rounded bg-muted">
                  <p className="text-sm">
                    You selected: <span className={selectedOption === currentQuestion.answer ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {selectedOption}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t p-4 flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="outline" onClick={handleNext}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FlashCard;