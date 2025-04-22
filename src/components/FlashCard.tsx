
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
  
  const handleSelectOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(option);
    setFlipped(true);
  };
  
  return (
    <div className="flex flex-col space-y-6 items-center">
      <div className="flex justify-between items-center text-sm text-muted-foreground w-full max-w-md px-2">
        <span className="font-medium">Card {currentIndex + 1} / {questions.length}</span>
        <Button variant="ghost" size="sm" onClick={toggleFlip} className="text-xs">
          <RotateCw className="h-3.5 w-3.5 mr-1" />
          Flip Card
        </Button>
      </div>
      
      <div className="perspective-1000 w-full max-w-md">
        <div 
          className={`w-full h-[380px] cursor-pointer transition-all duration-700 transform-style-preserve-3d hover:shadow-lg rounded-xl ${
            flipped ? 'rotate-y-180' : ''
          }`}
          onClick={toggleFlip}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full backface-hidden rounded-xl bg-white text-gray-800 border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/80 rounded-t-lg">
              <h3 className="text-base font-semibold text-center text-gray-700">
                {currentQuestion.title}
              </h3>
            </div>
            
            <div className="p-4 flex flex-col justify-center h-[calc(100%-75px)]">
              <p className="text-base font-medium mb-6 text-center text-gray-600 px-3">
                {currentQuestion.question}
              </p>
              
              <div className="grid gap-2">
                {currentQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={selectedOption === option ? "default" : "outline"}
                    className={`justify-start text-left h-auto py-2 px-3 transition-all duration-200
                      ${selectedOption === option 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      } hover:scale-[1.02] text-sm`}
                    onClick={(e) => handleSelectOption(option, e)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                Click to flip
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl bg-white text-gray-800 border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/80 rounded-t-lg">
              <h3 className="text-base font-semibold text-center text-gray-700">
                Answer
              </h3>
            </div>
            
            <div className="p-4 flex flex-col items-center justify-center h-[calc(100%-75px)]">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 w-5/6 text-center shadow-sm">
                <p className="text-xl font-semibold text-gray-700 mb-2">{currentQuestion.answer}</p>
                
                {selectedOption && (
                  <div className={`mt-5 p-3 rounded-lg ${
                    selectedOption === currentQuestion.answer 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <p className="text-sm font-medium">
                      {selectedOption === currentQuestion.answer ? 'Correct!' : 'Incorrect...'}
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                      Your answer: {selectedOption}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                Click to flip back
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CardFooter className="p-0 flex justify-between gap-4 w-full max-w-md">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="flex-1 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={handleNext}
          className="flex-1 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </div>
  );
};

export default FlashCard;