import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export default function ComingSoonSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="min-h-[50vh] flex w-[95%] md:w-4/5 lg:w-3/5 mx-auto items-center justify-center"
    >
      <Card className="bg-gradient-to-br from-white to-primary/5 hover:shadow-lg transition-all duration-300">
        <CardContent className="py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  More Insights Coming Soon
                </h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;re working on bringing you detailed analytics about
                  similar companies, comparison with industry, and more.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary hover:bg-primary/10"
            >
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
