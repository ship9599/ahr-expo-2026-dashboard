/**
 * AHR Expo 2026 - Official Event Information Component
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, DollarSign, Info, Bus, Map } from "lucide-react";

export default function ExpoInfo() {
  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-1">Show Dates</div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>Mon, Feb 2: 10am-6pm</div>
                <div>Tue, Feb 3: 10am-6pm</div>
                <div>Wed, Feb 4: 10am-4pm</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-1">Venue</div>
              <div className="text-xs text-muted-foreground">
                <div>Las Vegas Convention Center</div>
                <div>Central & South Halls</div>
                <div className="mt-1">3150 Paradise Rd</div>
                <div>Las Vegas, NV 89109</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-1">Registration</div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div><Badge variant="secondary" className="text-[10px]">FREE</Badge> through Jan 31</div>
                <div>$10 starting Feb 1</div>
                <div className="mt-1 text-[10px]">Adults only (18+)</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Information */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Event Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Badge Pickup */}
          <div>
            <div className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Badge Pickup & Registration
            </div>
            <div className="text-xs text-muted-foreground space-y-1 ml-5">
              <div><span className="font-medium">Sun, Feb 1:</span> 12pm-4pm</div>
              <div><span className="font-medium">Mon, Feb 2:</span> 7am-6pm</div>
              <div><span className="font-medium">Tue, Feb 3:</span> 8am-6pm</div>
              <div><span className="font-medium">Wed, Feb 4:</span> 8am-4pm</div>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="font-medium mb-1">Locations:</div>
                <div>• South Hall, Level 1</div>
                <div>• Central Hall Concourse (N109-N114)</div>
              </div>
            </div>
          </div>

          {/* Transportation */}
          <div>
            <div className="font-medium mb-2 flex items-center gap-2">
              <Bus className="h-3 w-3" />
              Transportation
            </div>
            <div className="text-xs text-muted-foreground space-y-1 ml-5">
              <div>• Free shuttle service between show hotels and convention center</div>
              <div>• Las Vegas Monorail access</div>
              <div>• LOOP stops available</div>
              <div>• Parking at convention center</div>
            </div>
          </div>

          {/* Planning Tools */}
          <div>
            <div className="font-medium mb-2 flex items-center gap-2">
              <Map className="h-3 w-3" />
              Planning Tools
            </div>
            <div className="text-xs text-muted-foreground space-y-1 ml-5">
              <div>• <span className="font-medium">My Show Planner:</span> Schedule meetings with exhibitors</div>
              <div>• <span className="font-medium">AHR Expo App:</span> Custom agenda, maps, exhibitor info</div>
              <div>• <span className="font-medium">Product Preview:</span> Advanced look at products</div>
              <div>• Free industry seminars and education sessions</div>
            </div>
          </div>

          {/* Badge Deadlines */}
          <div>
            <div className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Important Deadlines
            </div>
            <div className="text-xs text-muted-foreground space-y-1 ml-5">
              <div><span className="font-medium">Dec 4, 2025:</span> International badge by mail</div>
              <div><span className="font-medium">Jan 12, 2026:</span> Domestic badge by mail</div>
              <div><span className="font-medium">Jan 31, 2026:</span> Free registration ends</div>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-[10px]">ASHRAE Winter Conference: Jan 31 - Feb 4</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
