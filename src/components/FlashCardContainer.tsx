import React, { useEffect, useState } from 'react';
import FlashCard from './FlashCard';

interface QuizQuestion {
  title: string;
  question: string;
  options: string[];
  answer: string;
}

interface FlashCardContainerProps {
  jsonData: string | null;
}

const FlashCardContainer: React.FC<FlashCardContainerProps> = ({ jsonData }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jsonData) return;

    try {
      // Clean up the JSON string
      let cleanedData = jsonData.replace(/```json|```/g, '').trim();
      
      // Check if the data is wrapped in an array
      if (!cleanedData.startsWith('[')) {
        // If not, let's try to fix common issues
        
        // Replace all closing brackets + comma + opening brackets with comma
        cleanedData = cleanedData.replace(/}[\s]*,[\s]*{/g, '},{');
        
        // Now wrap it all in an array
        cleanedData = `[${cleanedData}]`;
      }
      
      console.log("Cleaned JSON data:", cleanedData);
      
      // Parse the JSON string to get an array of questions
      const parsedData = JSON.parse(cleanedData);
      
      // Validate the parsed data
      if (Array.isArray(parsedData)) {
        setQuestions(parsedData);
        setError(null);
      } else if (typeof parsedData === 'object') {
        // Handle single question object
        setQuestions([parsedData]);
        setError(null);
      } else {
        setError('Invalid quiz data format');
      }
    } catch (err) {
      console.error('Error parsing JSON data:', err);
      setError('Error parsing quiz data. Please check the console for details.');
      
      // Let's try a different approach - manually parse objects
      try {
        const objectsArray = manuallyParseJsonObjects(jsonData);
        if (objectsArray.length > 0) {
          setQuestions(objectsArray);
          setError(null);
        }
      } catch (manualErr) {
        console.error('Error with manual parsing:', manualErr);
      }
    }
  }, [jsonData]);

  // Function to manually parse a string of JSON objects
  const manuallyParseJsonObjects = (jsonStr: string): QuizQuestion[] => {
    // Remove markdown code blocks if present
    const cleaned = jsonStr.replace(/```json|```/g, '').trim();
    
    // Split the string by objects (look for }, pattern)
    const objStrings = cleaned.split(/},\s*{/).map((str, i) => {
      // Add the brackets back except for first and last item
      if (i === 0) {
        return str.endsWith('}') ? str : str + '}';
      } else {
        return '{' + (str.endsWith('}') ? str : str + '}');
      }
    });
    
    // Parse each object string
    const objects = objStrings.map(str => {
      try {
        return JSON.parse(str);
      } catch (err) {
        console.warn('Failed to parse individual object:', str);
        return null;
      }
    }).filter(Boolean) as QuizQuestion[];
    
    return objects;
  };

  if (error) {
    return (
      <div className="p-4 border rounded bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }

  if (!jsonData) {
    return null;
  }

  if (questions.length === 0) {
    return (
      <div className="p-4 border rounded bg-muted">
        Processing quiz data...
      </div>
    );
  }

  return <FlashCard questions={questions} />;
};

export default FlashCardContainer;