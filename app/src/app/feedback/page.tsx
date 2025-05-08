'use client'

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSendFeedback } from "@/hooks/feedback/useSendFeeback";
import { SendFeedbackDtoTypeEnum as FeedbackType } from "@/sdk";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const displayNames = {
  'BUG': 'Bug',
  'FEATURE_REQUEST': 'Feature Request',
  'OTHER': 'Other'
};

export default function Feedback() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [type, setType] = useState<FeedbackType>(FeedbackType.Other);
  const { mutate, isPending } = useSendFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    mutate({ sendFeedbackDto: {
      name,
      email,
      feedback,
      type,
    }});
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto"
    >
      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-3xl font-bold mb-2 text-center"
      >
        Do you have any feedback for us?
      </motion.h1>
      <p className="text-gray-500 mb-8 text-center">We value your thoughts and suggestions!</p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input 
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name" 
            required
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input 
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com" 
            required
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="feedback" className="text-sm font-medium">
            Your Feedback
          </label>
          <Textarea 
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please share your thoughts with us..." 
            required
            className="w-full min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Feedback Type
          </label>

          <Select
                onValueChange={(value: string) => setType(value as FeedbackType)}
                value={type}
              >
                <SelectTrigger
                  id="course"
                  className="h-11 border-slate-200 focus:ring-2 focus:ring-primary/20"
                >
                  <SelectValue
                    placeholder={
                      "Feedback Type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FeedbackType).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {displayNames[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send feedback
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
