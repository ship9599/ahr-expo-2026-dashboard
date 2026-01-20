/**
 * Timeline Component - Hour-by-hour visualization of broker events
 * Design: Financial terminal aesthetic with color-coded broker activities
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useState } from "react";

interface TimelineEvent {
  broker: string;
  time: string;
  company: string;
  booth?: string;
  activity?: string;
  day: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

// Broker color mapping for consistent visualization
const BROKER_COLORS = {
  'KeyBanc Capital Markets': {
    bg: 'oklch(0.70 0.12 210)',
    text: 'oklch(0.98 0 0)',
    border: 'oklch(0.60 0.12 210)'
  },
  'Robert W. Baird': {
    bg: 'oklch(0.70 0.18 145)',
    text: 'oklch(0.98 0 0)',
    border: 'oklch(0.60 0.18 145)'
  },
  'D.A. Davidson': {
    bg: 'oklch(0.75 0.15 60)',
    text: 'oklch(0.15 0.01 240)',
    border: 'oklch(0.65 0.15 60)'
  }
};

function parseTime(timeStr: string): { hour: number; minute: number; isPM: boolean } {
  // Handle formats like "10:00am-10:30am PST" or "9:30am"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([ap]m)/i);
  if (!match) return { hour: 0, minute: 0, isPM: false };
  
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const isPM = match[3].toLowerCase() === 'pm';
  
  // Convert to 24-hour format
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  
  return { hour, minute, isPM };
}

function getTimePosition(timeStr: string): number {
  const { hour, minute } = parseTime(timeStr);
  // Position relative to 9am start (9am = 0%, 3pm = 100%)
  const startHour = 9;
  const totalHours = 6; // 9am to 3pm
  const hoursFromStart = hour - startHour + minute / 60;
  return Math.max(0, Math.min(100, (hoursFromStart / totalHours) * 100));
}

export default function Timeline({ events }: TimelineProps) {
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday'>('Monday');
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  // Filter events by selected day
  const dayEvents = events.filter(e => {
    if (selectedDay === 'Monday') {
      return e.day === 'Monday' || e.time.includes('Monday') || !e.day;
    }
    return e.day === 'Tuesday';
  });

  // Generate time labels (9am to 3pm)
  const timeLabels = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM'
  ];

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedDay('Monday')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            selectedDay === 'Monday'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Monday, Feb 2
        </button>
        <button
          onClick={() => setSelectedDay('Tuesday')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            selectedDay === 'Tuesday'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Tuesday, Feb 3
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded border border-border">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Brokers:
        </div>
        {Object.entries(BROKER_COLORS).map(([broker, colors]) => (
          <div key={broker} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border
              }}
            />
            <span className="text-sm">{broker.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Timeline Container */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5" style={{ color: 'oklch(0.70 0.12 210)' }} />
          <h3 className="text-lg font-semibold">
            {selectedDay}, February {selectedDay === 'Monday' ? '2' : '3'}, 2026
          </h3>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Time axis */}
          <div className="flex justify-between mb-4 px-2">
            {timeLabels.map((label) => (
              <div key={label} className="text-xs text-muted-foreground font-mono">
                {label}
              </div>
            ))}
          </div>

          {/* Timeline track */}
          <div className="relative h-2 bg-muted/30 rounded-full mb-6">
            {/* Hour markers */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-border"
                style={{ left: `${(i / 6) * 100}%` }}
              />
            ))}
          </div>

          {/* Events by broker */}
          <div className="space-y-6">
            {Object.keys(BROKER_COLORS).map((broker) => {
              const brokerEvents = dayEvents.filter((e) => e.broker === broker);
              if (brokerEvents.length === 0) return null;

              const colors = BROKER_COLORS[broker as keyof typeof BROKER_COLORS];

              return (
                <div key={broker} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border
                      }}
                    />
                    <span className="text-sm font-medium">{broker}</span>
                  </div>

                  {/* Event track */}
                  <div className="relative h-16 bg-muted/20 rounded border border-border">
                    {brokerEvents.map((event, idx) => {
                      const position = getTimePosition(event.time);
                      const width = 12; // Approximate width percentage for each event

                      return (
                        <div
                          key={idx}
                          className="absolute top-1 bottom-1 rounded cursor-pointer transition-all hover:z-10 hover:scale-105"
                          style={{
                            left: `${position}%`,
                            width: `${width}%`,
                            backgroundColor: colors.bg,
                            borderLeft: `3px solid ${colors.border}`
                          }}
                          onMouseEnter={() => setHoveredEvent(event)}
                          onMouseLeave={() => setHoveredEvent(null)}
                        >
                          <div className="p-2 h-full flex flex-col justify-center">
                            <div
                              className="text-xs font-medium truncate"
                              style={{ color: colors.text }}
                            >
                              {event.company}
                            </div>
                            <div
                              className="text-xs font-mono opacity-90 truncate"
                              style={{ color: colors.text }}
                            >
                              {event.time.split('-')[0].trim()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hover tooltip */}
          {hoveredEvent && (
            <div className="fixed z-50 pointer-events-none" style={{ 
              left: '50%', 
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <Card className="p-4 shadow-lg border-2 border-primary max-w-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {hoveredEvent.time}
                    </Badge>
                    <Badge variant="secondary">{hoveredEvent.broker.split(' ')[0]}</Badge>
                  </div>
                  <div className="font-semibold">{hoveredEvent.company}</div>
                  {hoveredEvent.booth && (
                    <div className="text-sm text-muted-foreground">
                      Booth: {hoveredEvent.booth}
                    </div>
                  )}
                  {hoveredEvent.activity && (
                    <div className="text-sm text-muted-foreground">
                      {hoveredEvent.activity}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Event List */}
      <Card className="p-5">
        <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">
          All Events - {selectedDay}
        </h4>
        <div className="space-y-2">
          {dayEvents.map((event, idx) => {
            const colors = BROKER_COLORS[event.broker as keyof typeof BROKER_COLORS];
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.bg }}
                />
                <span className="text-xs font-mono text-muted-foreground w-24">
                  {event.time.split('-')[0].trim()}
                </span>
                <span className="text-sm font-medium flex-1">{event.company}</span>
                <span className="text-xs text-muted-foreground">{event.broker.split(' ')[0]}</span>
                {event.booth && (
                  <span className="text-xs font-mono text-muted-foreground">
                    {event.booth}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
