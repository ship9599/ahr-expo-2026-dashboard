/**
 * AHR Expo 2026 - TripIt-Style Itinerary Planner
 * Mobile-responsive vertical timeline with filtering, team coordination, and summary pages
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, Clock, MapPin, Navigation, User, Users, Info, ArrowLeft, AlertCircle, Download, ChevronLeft, ChevronRight, Coffee, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import ExpoInfo from "@/components/ExpoInfo";

interface ScheduleEvent {
  id: string;
  day: string;
  time: string;
  endTime?: string;
  type: string;
  broker: string;
  ticker: string;
  company: string;
  booth: string;
  location?: string;
  host?: string;
  duration?: number;
  travel?: string;
  assignedTo: string | null;
  notes?: string;
}

interface Broker {
  id: string;
  name: string;
  fullName?: string;
  color: string;
  analysts?: string[];
  sales?: string[];
  team?: Array<{ name: string; role: string }>;
  insights?: string | string[];
  focus?: string | string[];
}

interface TeamMember {
  id: string;
  name: string;
}

interface Company {
  ticker: string;
  name: string;
  booth: string;
  segment: string;
  stackPosition: string;
  tldr: string;
  valueProp: string;
  marketCap: string;
  keyProducts: string[];
  notes: string;
}

interface ItineraryData {
  event: {
    name: string;
    location: string;
    dates: string;
    venue?: string;
  };
  conestogaTeam: TeamMember[];
  brokers: Broker[];
  schedule: ScheduleEvent[];
  companies: Company[];
}

const EVENT_TYPE_ICONS: Record<string, any> = {
  meeting: Building2,
  booth_tour: Users,
};

export default function Home() {
  const [data, setData] = useState<ItineraryData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [view, setView] = useState<'timeline' | 'brokers' | 'team' | 'info' | 'calendar' | 'companies'>('timeline');
  const [companyNotes, setCompanyNotes] = useState<Record<string, string>>({});
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [calendarDay, setCalendarDay] = useState<'monday' | 'tuesday'>('monday');
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    day: "all",
    broker: "all",
    company: "all",
    team: "all"
  });

  // Get next upcoming event
  const getNextEvent = () => {
    const now = new Date();
    const scheduledEvents = schedule.filter(e => e.time !== "TBD");
    return scheduledEvents.find(evt => {
      const eventDate = new Date(evt.day);
      const [hours, minutes] = evt.time.split(':');
      const isPM = evt.time.includes('PM');
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      eventDate.setHours(hour, parseInt(minutes) || 0);
      return eventDate > now;
    });
  };

  useEffect(() => {
    fetch('/itinerary_data.json')
      .then((res) => res.json())
      .then((d: ItineraryData) => {
        setData(d);
        // Load assignments from localStorage
        const savedAssignments = localStorage.getItem('ahr-assignments');
        if (savedAssignments) {
          const assignments = JSON.parse(savedAssignments);
          const updatedSchedule = d.schedule.map(evt => ({
            ...evt,
            assignedTo: assignments[evt.id] || null
          }));
          setSchedule(updatedSchedule);
        } else {
          setSchedule(d.schedule);
        }
        // Load company notes from localStorage
        const savedNotes = localStorage.getItem('ahr-company-notes');
        if (savedNotes) {
          setCompanyNotes(JSON.parse(savedNotes));
        }
      })
      .catch((err) => console.error('Failed to load data:', err));
  }, []);

  const handleCompanyNoteChange = (ticker: string, note: string) => {
    const updated = { ...companyNotes, [ticker]: note };
    setCompanyNotes(updated);
    localStorage.setItem('ahr-company-notes', JSON.stringify(updated));
  };

  const handleAssignment = (eventId: string, teamMemberId: string | null) => {
    const updated = schedule.map(evt =>
      evt.id === eventId ? { ...evt, assignedTo: teamMemberId } : evt
    );
    setSchedule(updated);
    
    // Save to localStorage
    const assignments: Record<string, string | null> = {};
    updated.forEach(evt => {
      assignments[evt.id] = evt.assignedTo;
    });
    localStorage.setItem('ahr-assignments', JSON.stringify(assignments));
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading itinerary...</div>
      </div>
    );
  }

  // Apply filters
  const filteredSchedule = schedule.filter(evt => {
    if (filters.day !== "all" && evt.day !== filters.day) return false;
    if (filters.broker !== "all" && evt.broker !== filters.broker) return false;
    if (filters.company !== "all" && evt.ticker !== filters.company) return false;
    if (filters.team !== "all") {
      if (filters.team === "unassigned" && evt.assignedTo !== null) return false;
      if (filters.team !== "unassigned" && evt.assignedTo !== filters.team) return false;
    }
    return true;
  });

  // Group by day
  const groupedByDay: Record<string, ScheduleEvent[]> = {};
  filteredSchedule.forEach(evt => {
    if (!groupedByDay[evt.day]) groupedByDay[evt.day] = [];
    groupedByDay[evt.day].push(evt);
  });

  // Sort within each day - proper 12-hour time parsing
  const parseTime = (timeStr: string): number => {
    if (timeStr === 'TBD') return 9999;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 9999;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  Object.keys(groupedByDay).forEach(day => {
    groupedByDay[day].sort((a, b) => parseTime(a.time) - parseTime(b.time));
  });

  const uniqueCompanies = Array.from(new Set(schedule.map(e => e.ticker))).sort();

  // Generate ICS calendar file
  const generateICS = (events: ScheduleEvent[]) => {
    const formatDate = (day: string, time: string) => {
      const date = day === 'monday' ? '20260202' : '20260203';
      const [timePart, ampm] = time.split(' ');
      const [hours, mins] = timePart.split(':');
      let hour = parseInt(hours);
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      return `${date}T${hour.toString().padStart(2, '0')}${(mins || '00').padStart(2, '0')}00`;
    };

    let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AHR Expo 2026//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    events.forEach(evt => {
      const broker = data?.brokers.find(b => b.id === evt.broker);
      const start = formatDate(evt.day, evt.time);
      const end = evt.endTime ? formatDate(evt.day, evt.endTime) : formatDate(evt.day, evt.time);
      ics += `BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${evt.ticker} - ${broker?.name || evt.broker}
DESCRIPTION:${evt.company}${evt.host ? ' | Host: ' + evt.host : ''}${evt.notes ? ' | ' + evt.notes : ''}
LOCATION:${evt.booth ? 'Booth ' + evt.booth : evt.location || 'Las Vegas Convention Center'}
END:VEVENT
`;
    });

    ics += 'END:VCALENDAR';
    return ics;
  };

  const downloadCalendar = (events: ScheduleEvent[], filename: string) => {
    const ics = generateICS(events);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get events for calendar view by hour
  const getCalendarEvents = (day: 'monday' | 'tuesday') => {
    return schedule.filter(e => e.day === day && e.time !== 'TBD').sort((a, b) => parseTime(a.time) - parseTime(b.time));
  };

  // Time slots for calendar grid (8am - 5pm) - includes half hours for meetings that start at :30
  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', 
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
  ];

  // Broker Summary View
  if (view === 'brokers' && selectedBrokerId) {
    const broker = data.brokers.find(b => b.id === selectedBrokerId);
    const brokerEvents = schedule.filter(e => e.broker === selectedBrokerId);
    const companies = Array.from(new Set(brokerEvents.map(e => e.ticker)));

    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <div className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
          <div className="container py-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedBrokerId(null)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: broker?.color }} />
              <h1 className="text-xl font-bold">{broker?.fullName}</h1>
            </div>
          </div>
        </div>

        <div className="container py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="text-2xl font-bold">{brokerEvents.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{companies.length}</div>
              <div className="text-xs text-muted-foreground">Companies</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{(broker?.team?.length || 0) + (broker?.analysts?.length || 0)}</div>
              <div className="text-xs text-muted-foreground">Team Members</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{brokerEvents.filter(e => e.assignedTo).length}</div>
              <div className="text-xs text-muted-foreground">Assigned</div>
            </Card>
          </div>

          {/* Team */}
          {broker && ((broker.team && broker.team.length > 0) || (broker.analysts && broker.analysts.length > 0)) && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Attending
              </h3>
              <div className="space-y-2">
                {broker.analysts?.map((analyst: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{analyst}</span>
                    <span className="text-muted-foreground">• Analyst</span>
                  </div>
                ))}
                {broker.sales?.map((sales: string, idx: number) => (
                  <div key={`s-${idx}`} className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{sales}</span>
                    <span className="text-muted-foreground">• Sales</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Insights */}
          {broker && broker.insights && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Key Insights</h3>
              <div className="text-sm text-muted-foreground">
                {typeof broker.insights === 'string' ? broker.insights : broker.insights.join('. ')}
              </div>
            </Card>
          )}

          {/* Companies */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Companies Meeting With</h3>
            <div className="flex flex-wrap gap-2">
              {companies.map(ticker => (
                <Badge key={ticker} variant="secondary">{ticker}</Badge>
              ))}
            </div>
          </Card>

          {/* Events */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Schedule</h3>
            <div className="space-y-4">
              {Object.entries(
                brokerEvents.reduce((acc, evt) => {
                  if (!acc[evt.day]) acc[evt.day] = [];
                  acc[evt.day].push(evt);
                  return acc;
                }, {} as Record<string, ScheduleEvent[]>)
              ).map(([day, events]) => (
                <div key={day}>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">{day}</div>
                  <div className="space-y-2">
                    {events.map(evt => (
                      <div key={evt.id} className="border-l-2 pl-3 py-1" style={{ borderColor: broker?.color }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold">{evt.ticker}</div>
                            <div className="text-sm text-muted-foreground">{evt.time} • {evt.booth}</div>
                            {evt.notes && (
                              <div className="text-xs text-muted-foreground mt-1">{evt.notes}</div>
                            )}
                          </div>
                          {evt.assignedTo && (
                            <Badge variant="outline" className="text-xs">
                              {data.conestogaTeam.find(t => t.id === evt.assignedTo)?.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Team Member Summary View
  if (view === 'team' && selectedTeamId) {
    const teamMember = data.conestogaTeam.find(t => t.id === selectedTeamId);
    const memberEvents = schedule.filter(e => e.assignedTo === selectedTeamId);
    const brokers = Array.from(new Set(memberEvents.map(e => e.broker)));
    const companies = Array.from(new Set(memberEvents.map(e => e.ticker)));

    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <div className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
          <div className="container py-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTeamId(null)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h1 className="text-xl font-bold">{teamMember?.name}'s Schedule</h1>
            </div>
          </div>
        </div>

        <div className="container py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="text-2xl font-bold">{memberEvents.length}</div>
              <div className="text-xs text-muted-foreground">Assigned Events</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{companies.length}</div>
              <div className="text-xs text-muted-foreground">Companies</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{brokers.length}</div>
              <div className="text-xs text-muted-foreground">Brokers</div>
            </Card>
          </div>

          {memberEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No events assigned yet.</p>
            </Card>
          ) : (
            <>
              {/* Companies */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Companies</h3>
                <div className="flex flex-wrap gap-2">
                  {companies.map(ticker => (
                    <Badge key={ticker} variant="secondary">{ticker}</Badge>
                  ))}
                </div>
              </Card>

              {/* Events */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Schedule</h3>
                <div className="space-y-4">
                  {Object.entries(
                    memberEvents.reduce((acc, evt) => {
                      if (!acc[evt.day]) acc[evt.day] = [];
                      acc[evt.day].push(evt);
                      return acc;
                    }, {} as Record<string, ScheduleEvent[]>)
                  ).map(([day, events]) => (
                    <div key={day}>
                      <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">{day}</div>
                      <div className="space-y-2">
                        {events.map(evt => {
                          const broker = data.brokers.find(b => b.id === evt.broker);
                          return (
                            <div key={evt.id} className="border-l-2 pl-3 py-1" style={{ borderColor: broker?.color }}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold">{evt.ticker}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {evt.time} • {broker?.name} • {evt.booth}
                                  </div>
                                  {evt.notes && (
                                    <div className="text-xs text-muted-foreground mt-1">{evt.notes}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main Timeline View
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-border bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 md:py-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{data.event.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{data.event.location}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Feb 2-3, 2026</span>
              </div>
            </div>
            
            {(() => {
              const nextEvent = getNextEvent();
              if (!nextEvent) return null;
              const broker = data.brokers.find(b => b.id === nextEvent.broker);
              return (
                <Card className="p-3 md:p-4 bg-primary/5 border-primary/20 md:max-w-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Next Meeting</div>
                      <div className="font-bold text-base">{nextEvent.ticker}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{nextEvent.time} • {nextEvent.booth}</div>
                      {broker && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: broker.color }}></div>
                          <span className="text-xs text-muted-foreground">{broker.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="container py-4 overflow-x-hidden">
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="mb-4 w-full md:w-auto grid grid-cols-3 md:grid-cols-6 gap-1 h-auto p-1">
            <TabsTrigger value="timeline" className="text-xs md:text-sm px-2 py-1.5">Timeline</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs md:text-sm px-2 py-1.5">Calendar</TabsTrigger>
            <TabsTrigger value="companies" className="text-xs md:text-sm px-2 py-1.5">Companies</TabsTrigger>
            <TabsTrigger value="brokers" className="text-xs md:text-sm px-2 py-1.5">Brokers</TabsTrigger>
            <TabsTrigger value="team" className="text-xs md:text-sm px-2 py-1.5">Team</TabsTrigger>
            <TabsTrigger value="info" className="text-xs md:text-sm px-2 py-1.5">Info</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0">
            {/* Filters */}
            <Card className="p-3 md:p-4 mb-4 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap gap-2">
                <Select value={filters.day} onValueChange={(v) => setFilters({...filters, day: v})}>
                  <SelectTrigger className="text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.broker} onValueChange={(v) => setFilters({...filters, broker: v})}>
                  <SelectTrigger className="text-sm">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brokers</SelectItem>
                    {data.brokers.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.company} onValueChange={(v) => setFilters({...filters, company: v})}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {uniqueCompanies.map(ticker => (
                      <SelectItem key={ticker} value={ticker}>{ticker}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.team} onValueChange={(v) => setFilters({...filters, team: v})}>
                  <SelectTrigger className="text-sm">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team</SelectItem>
                    {data.conestogaTeam.map(tm => (
                      <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>
                    ))}
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>

                {(filters.day !== "all" || filters.broker !== "all" || filters.company !== "all" || filters.team !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ day: "all", broker: "all", company: "all", team: "all" })}
                    className="col-span-2 md:col-span-1"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </Card>

            {/* Broker Quick Access */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {data.brokers.map(broker => (
                <Button
                  key={broker.id}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-xs md:text-sm"
                  onClick={() => setSelectedBroker(broker)}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: broker.color }} />
                  {broker.name}
                  <Info className="h-3 w-3" />
                </Button>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {Object.entries(groupedByDay).map(([day, events]) => (
                <div key={day}>
                  <div className="bg-muted/50 px-3 md:px-4 py-2 rounded-lg mb-3 sticky top-[72px] z-[5]">
                    <h2 className="text-xs md:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {day}
                    </h2>
                  </div>

                  <div className="space-y-0">
                    {events.map((evt, idx) => {
                      const broker = data.brokers.find(b => b.id === evt.broker);
                      const Icon = EVENT_TYPE_ICONS[evt.type] || Building2;
                      const assignedMember = data.conestogaTeam.find(tm => tm.id === evt.assignedTo);

                      return (
                        <div key={evt.id} className="flex gap-2 md:gap-3 pb-4 relative">
                          {idx < events.length - 1 && (
                            <div className="absolute left-[31px] md:left-[39px] top-[44px] bottom-0 w-[2px] bg-border" />
                          )}

                          {/* Time */}
                          <div className="w-16 md:w-20 flex-shrink-0 pt-1">
                            <div className="text-xs md:text-sm font-semibold">{evt.time}</div>
                            {evt.endTime && (
                              <div className="text-[10px] md:text-xs text-muted-foreground">{evt.endTime}</div>
                            )}
                          </div>

                          {/* Icon */}
                          <div className="flex-shrink-0 pt-1">
                            <div
                              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: broker?.color }}
                            >
                              <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                          </div>

                          {/* Event Card */}
                          <Card className="flex-1 p-4 md:p-4 hover:bg-accent/30 hover:shadow-md transition-all overflow-hidden">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <h3 
                                      className="text-lg md:text-xl font-bold text-primary hover:underline cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const company = data.companies.find(c => c.ticker === evt.ticker);
                                        if (company) {
                                          setSelectedCompany(company);
                                          setView('companies');
                                        }
                                      }}
                                    >{evt.ticker}</h3>
                                    <Badge variant="secondary" className="text-[10px] md:text-xs">
                                      {evt.type === 'booth_tour' ? 'Booth Tour' : 'Meeting'}
                                    </Badge>
                                  </div>
                                  <div className="text-sm md:text-base text-muted-foreground mb-2.5 truncate">{evt.company}</div>

                                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm md:text-base">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: broker?.color }} />
                                      <span className="font-medium">{broker?.name}</span>
                                    </div>
                                    {evt.host && (
                                      <div className="text-muted-foreground">
                                        {evt.host}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      {evt.booth}
                                    </div>
                                    {evt.duration && (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {evt.duration}m
                                      </div>
                                    )}
                                  </div>

                                  {evt.travel && (
                                    <div className="flex items-center gap-1 mt-2 text-[10px] md:text-xs text-muted-foreground">
                                      <Navigation className="h-3 w-3" />
                                      {evt.travel}
                                    </div>
                                  )}
                                </div>

                                {/* Assignment - Desktop */}
                                <div className="hidden md:block flex-shrink-0">
                                  <Select
                                    value={evt.assignedTo || "unassigned"}
                                    onValueChange={(v) => handleAssignment(evt.id, v === "unassigned" ? null : v)}
                                  >
                                    <SelectTrigger className="w-[110px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">
                                        <span className="text-muted-foreground">Unassigned</span>
                                      </SelectItem>
                                      {data.conestogaTeam.map(tm => (
                                        <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Assignment - Mobile */}
                              <div className="md:hidden">
                                <Select
                                  value={evt.assignedTo || "unassigned"}
                                  onValueChange={(v) => handleAssignment(evt.id, v === "unassigned" ? null : v)}
                                >
                                  <SelectTrigger className="w-full h-8 text-xs">
                                    <User className="h-3 w-3 mr-2" />
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">
                                      <span className="text-muted-foreground">Unassigned</span>
                                    </SelectItem>
                                    {data.conestogaTeam.map(tm => (
                                      <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {filteredSchedule.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No events match your filters.</p>
              </Card>
            )}
          </TabsContent>

          {/* Calendar Tab - iPhone-style swipeable day view */}
          <TabsContent value="calendar" className="mt-0">
            {/* Day Selector */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalendarDay('monday')}
                disabled={calendarDay === 'monday'}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {calendarDay === 'monday' ? 'Monday, February 2' : 'Tuesday, February 3'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getCalendarEvents(calendarDay).length} events
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalendarDay('tuesday')}
                disabled={calendarDay === 'tuesday'}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Export Button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCalendar(getCalendarEvents(calendarDay), `ahr-expo-${calendarDay}.ics`)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Calendar
              </Button>
            </div>

            {/* Calendar Grid */}
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {timeSlots.map(slot => {
                  const slotEvents = getCalendarEvents(calendarDay).filter(e => {
                    // Match events to their exact time slot (including half-hours)
                    const eventTime = e.time.toUpperCase().replace(/\s+/g, ' ');
                    const slotTime = slot.toUpperCase();
                    // Normalize both to compare: "8:30 AM" should match "8:30 AM" slot
                    const normalizeTime = (t: string) => {
                      const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                      if (!match) return '';
                      return `${match[1]}:${match[2]} ${match[3].toUpperCase()}`;
                    };
                    return normalizeTime(eventTime) === normalizeTime(slotTime);
                  });

                  // Only show time slots that have events
                  if (slotEvents.length === 0) return null;

                  return (
                    <div key={slot} className="flex min-h-[60px]">
                      {/* Time Column */}
                      <div className="w-20 md:w-24 flex-shrink-0 p-2 md:p-3 bg-muted/30 border-r border-border">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">{slot}</div>
                      </div>

                      {/* Events Column */}
                      <div className="flex-1 p-2 md:p-3">
                        {slotEvents.length > 0 && (
                          <div className="space-y-2">
                            {slotEvents.map(evt => {
                              const broker = data.brokers.find(b => b.id === evt.broker);
                              const EventIcon = evt.type === 'breakfast' ? Coffee : evt.type === 'lunch' ? Utensils : evt.type === 'booth_tour' ? Users : Building2;
                              return (
                                <div
                                  key={evt.id}
                                  className="flex items-start gap-2 p-2 rounded-lg border-l-4 bg-card shadow-sm"
                                  style={{ borderLeftColor: broker?.color }}
                                >
                                  <div
                                    className="p-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: `${broker?.color}20` }}
                                  >
                                    <EventIcon className="h-3 w-3" style={{ color: broker?.color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm">{evt.ticker}</span>
                                      <span className="text-xs text-muted-foreground">{evt.time}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{evt.company}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: broker?.color }} />
                                      <span className="text-xs">{broker?.name}</span>
                                      {evt.booth && (
                                        <span className="text-xs text-muted-foreground">• {evt.booth}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Broker Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {data.brokers.map(broker => (
                <div key={broker.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: broker.color }} />
                  <span className="text-xs">{broker.name}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="mt-0">
            {selectedCompany ? (
              /* Company Detail View */
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(null)} className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Companies
                </Button>
                <Card className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold">{selectedCompany.ticker}</h2>
                        {selectedCompany.booth && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />{selectedCompany.booth}
                          </Badge>
                        )}
                      </div>
                      <div className="text-lg text-muted-foreground">{selectedCompany.name}</div>
                    </div>
                    <Badge>{selectedCompany.marketCap}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Segment</div>
                      <div className="font-medium">{selectedCompany.segment}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stack Position</div>
                      <div className="font-medium">{selectedCompany.stackPosition}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Business Summary</div>
                      <p className="text-sm leading-relaxed">{selectedCompany.tldr}</p>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Value Proposition</div>
                      <p className="text-sm leading-relaxed">{selectedCompany.valueProp}</p>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Key Products</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompany.keyProducts.map((product, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{product}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Meetings */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Scheduled Meetings at AHR</div>
                    <div className="space-y-2">
                      {schedule.filter(e => e.ticker === selectedCompany.ticker).map(evt => {
                        const broker = data.brokers.find(b => b.id === evt.broker);
                        return (
                          <div key={evt.id} className="flex items-center gap-3 p-2 bg-accent/30 rounded text-sm">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: broker?.color }} />
                            <span className="font-medium">{evt.time}</span>
                            <span className="text-muted-foreground">{evt.day === 'monday' ? 'Mon' : 'Tue'}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{broker?.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">{evt.type}</Badge>
                          </div>
                        );
                      })}
                      {schedule.filter(e => e.ticker === selectedCompany.ticker).length === 0 && (
                        <div className="text-sm text-muted-foreground">No scheduled meetings</div>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Notes & Nuggets</div>
                    <textarea
                      className="w-full p-3 border rounded-md text-sm min-h-[120px] bg-background"
                      placeholder="Add your notes, insights, and key nuggets about this company..."
                      value={companyNotes[selectedCompany.ticker] || ''}
                      onChange={(e) => handleCompanyNoteChange(selectedCompany.ticker, e.target.value)}
                    />
                  </div>
                </Card>
              </div>
            ) : (
              /* Companies List View */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...data.companies].sort((a, b) => a.ticker.localeCompare(b.ticker)).map(company => {
                    const companyEvents = schedule.filter(e => e.ticker === company.ticker);
                    const hasNotes = companyNotes[company.ticker]?.length > 0;
                    return (
                      <Card
                        key={company.ticker}
                        className="p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedCompany(company)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{company.ticker}</h3>
                              {hasNotes && <Badge variant="secondary" className="text-xs">Notes</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">{company.name}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">{company.marketCap}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span className="bg-accent px-2 py-0.5 rounded">{company.segment}</span>
                          {company.booth && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{company.booth}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{company.tldr}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-1">
                            {Array.from(new Set(companyEvents.map(e => e.broker))).slice(0, 4).map(brokerId => {
                              const broker = data.brokers.find(b => b.id === brokerId);
                              return broker ? (
                                <div
                                  key={brokerId}
                                  className="w-5 h-5 rounded-full border-2 border-background"
                                  style={{ backgroundColor: broker.color }}
                                  title={broker.name}
                                />
                              ) : null;
                            })}
                          </div>
                          {companyEvents.length > 0 && (
                            <Badge variant="secondary" className="text-xs">{companyEvents.length} meeting{companyEvents.length > 1 ? 's' : ''}</Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Brokers Tab */}
          <TabsContent value="brokers" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.brokers.map(broker => {
                const brokerEvents = schedule.filter(e => e.broker === broker.id);
                const companies = Array.from(new Set(brokerEvents.map(e => e.ticker)));
                return (
                  <Card
                    key={broker.id}
                    className="p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedBrokerId(broker.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: broker.color }} />
                        <h3 className="font-bold">{broker.name}</h3>
                      </div>
                      <Badge variant="secondary">{brokerEvents.length} events</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{broker.fullName}</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {companies.slice(0, 5).map(ticker => (
                        <Badge key={ticker} variant="outline" className="text-xs">{ticker}</Badge>
                      ))}
                      {companies.length > 5 && (
                        <Badge variant="outline" className="text-xs">+{companies.length - 5}</Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full">
                      View Details →
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.conestogaTeam.map(member => {
                const memberEvents = schedule.filter(e => e.assignedTo === member.id);
                const companies = Array.from(new Set(memberEvents.map(e => e.ticker)));
                return (
                  <Card
                    key={member.id}
                    className="p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTeamId(member.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <h3 className="font-bold">{member.name}</h3>
                      </div>
                      <Badge variant="secondary">{memberEvents.length} events</Badge>
                    </div>
                    {memberEvents.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {companies.slice(0, 4).map(ticker => (
                            <Badge key={ticker} variant="outline" className="text-xs">{ticker}</Badge>
                          ))}
                          {companies.length > 4 && (
                            <Badge variant="outline" className="text-xs">+{companies.length - 4}</Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full">
                          View Schedule →
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No events assigned</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Expo Info Tab */}
          <TabsContent value="info" className="mt-0">
            <ExpoInfo />
          </TabsContent>
        </Tabs>
      </div>

      {/* Broker Detail Dialog */}
      <Dialog open={!!selectedBroker} onOpenChange={() => setSelectedBroker(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedBroker?.color }}
              />
              {selectedBroker?.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedBroker && ((selectedBroker.analysts && selectedBroker.analysts.length > 0) || (selectedBroker.sales && selectedBroker.sales.length > 0)) && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members Attending
                </h3>
                <div className="space-y-1">
                  {selectedBroker.analysts?.map((analyst: string, idx: number) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{analyst}</span>
                      <span className="text-muted-foreground">• Analyst</span>
                    </div>
                  ))}
                  {selectedBroker.sales?.map((sales: string, idx: number) => (
                    <div key={`s-${idx}`} className="text-sm flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{sales}</span>
                      <span className="text-muted-foreground">• Sales</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBroker && selectedBroker.insights && (
              <div>
                <h3 className="font-semibold mb-2">Key Insights</h3>
                <div className="text-sm text-muted-foreground">
                  {typeof selectedBroker.insights === 'string' ? selectedBroker.insights : selectedBroker.insights.join('. ')}
                </div>
              </div>
            )}

            {selectedBroker && selectedBroker.focus && (
              <div>
                <h3 className="font-semibold mb-2">Focus Areas</h3>
                <div className="text-sm text-muted-foreground">
                  {typeof selectedBroker.focus === 'string' ? selectedBroker.focus : selectedBroker.focus.join(', ')}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {schedule.filter(e => e.broker === selectedBroker?.id).length} events scheduled
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
