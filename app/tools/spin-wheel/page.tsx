"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCw, Plus, Trash2 } from "lucide-react";

export default function SpinWheelPage() {
  const [items, setItems] = useState<string[]>([
    "Option 1", 
    "Option 2", 
    "Option 3"
  ]);
  const [newItem, setNewItem] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSpin = () => {
    if (items.length === 0) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Simulate spinning animation
    let counter = 0;
    const totalSpins = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * items.length);
      setResult(items[randomIndex]);
      
      counter++;
      if (counter >= totalSpins) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <RotateCw className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Spin the Wheel</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Spin the wheel to get a random result
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Wheel Options</h2>
            </div>
            
            <div className="flex space-x-2 mb-4">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a new option..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                }}
              />
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto">
              {items.length > 0 ? (
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span>{item}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Add options to spin the wheel
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={handleSpin} 
                className="w-full" 
                disabled={items.length === 0 || isSpinning}
              >
                <RotateCw className={`h-4 w-4 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
              </Button>
            </div>
          </Card>

          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              {/* Add content for the right-hand side of the page */}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}