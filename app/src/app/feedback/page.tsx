'use client'

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/misc/useToast";

export default function Feedback() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    // We'll probably store this in the database and then use smth like SendGrid to send the email to the Admins
    setTimeout(() => {
      toast({
        title: "Feedback received!",
        description: "Thank you for your valuable feedback.",
        variant: "default",
      });
      setName("");
      setEmail("");
      setFeedback("");
      setIsSubmitting(false);
    }, 1500);
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
            className="w-full min-h-[120px]"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
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
