/**
 * Company Matrix Component - Broker-company coverage comparison
 * Design: High-density matrix showing which brokers cover which companies
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

interface CompanyData {
  name: string;
  ticker: string;
  booth: string;
  brokers: string[];
}

interface CompanyMatrixProps {
  companies: CompanyData[];
  brokers: string[];
}

// Broker color mapping
const BROKER_COLORS = {
  'KeyBanc Capital Markets': 'oklch(0.70 0.12 210)',
  'Robert W. Baird': 'oklch(0.70 0.18 145)',
  'D.A. Davidson': 'oklch(0.75 0.15 60)'
};

export default function CompanyMatrix({ companies, brokers }: CompanyMatrixProps) {
  const [highlightedBroker, setHighlightedBroker] = useState<string | null>(null);
  const [highlightedCompany, setHighlightedCompany] = useState<string | null>(null);

  // Calculate coverage statistics
  const stats = {
    exclusiveCoverage: companies.filter(c => c.brokers.length === 1).length,
    multipleCoverage: companies.filter(c => c.brokers.length > 1).length,
    totalMeetings: companies.reduce((sum, c) => sum + c.brokers.length, 0)
  };

  // Find overlapping companies
  const overlaps = companies.filter(c => c.brokers.length > 1);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Total Coverage
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {stats.totalMeetings}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Broker-company meetings
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Exclusive Coverage
          </div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: 'oklch(0.70 0.12 210)' }}>
            {stats.exclusiveCoverage}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Single broker only
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Multiple Coverage
          </div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: 'oklch(0.70 0.18 145)' }}>
            {stats.multipleCoverage}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Multiple brokers
          </div>
        </Card>
      </div>

      {/* Coverage Matrix */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Broker-Company Coverage Matrix</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 border-b-2 border-border bg-muted/30 sticky left-0 z-10">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Company
                  </div>
                </th>
                {brokers.map((broker) => {
                  const shortName = broker.split(' ')[0];
                  const color = BROKER_COLORS[broker as keyof typeof BROKER_COLORS];
                  return (
                    <th
                      key={broker}
                      className="p-3 border-b-2 border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onMouseEnter={() => setHighlightedBroker(broker)}
                      onMouseLeave={() => setHighlightedBroker(null)}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-xs font-medium whitespace-nowrap">
                          {shortName}
                        </div>
                      </div>
                    </th>
                  );
                })}
                <th className="text-center p-3 border-b-2 border-border bg-muted/30">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const isHighlighted = highlightedCompany === company.ticker;
                return (
                  <tr
                    key={company.ticker}
                    className={`border-b border-border hover:bg-accent/30 transition-colors ${
                      isHighlighted ? 'bg-accent/50' : ''
                    }`}
                    onMouseEnter={() => setHighlightedCompany(company.ticker)}
                    onMouseLeave={() => setHighlightedCompany(null)}
                  >
                    <td className="p-3 sticky left-0 bg-card border-r border-border">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-sm">{company.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs font-mono">
                              {company.ticker}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {company.booth}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {brokers.map((broker) => {
                      const hasCoverage = company.brokers.includes(broker);
                      const color = BROKER_COLORS[broker as keyof typeof BROKER_COLORS];
                      const isHighlightedBroker = highlightedBroker === broker;
                      
                      return (
                        <td
                          key={broker}
                          className={`p-3 text-center ${
                            isHighlightedBroker ? 'bg-muted/50' : ''
                          }`}
                        >
                          {hasCoverage ? (
                            <CheckCircle2
                              className="h-5 w-5 mx-auto"
                              style={{ color }}
                            />
                          ) : (
                            <Circle className="h-5 w-5 mx-auto text-muted-foreground/20" />
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-mono text-sm font-semibold">
                      {company.brokers.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="p-3 sticky left-0 bg-muted/30 font-semibold text-sm">
                  Total Companies
                </td>
                {brokers.map((broker) => {
                  const count = companies.filter(c => c.brokers.includes(broker)).length;
                  return (
                    <td key={broker} className="p-3 text-center font-mono font-semibold">
                      {count}
                    </td>
                  );
                })}
                <td className="p-3 text-center font-mono font-semibold">
                  {companies.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Overlap Analysis */}
      {overlaps.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Multiple Broker Coverage</h3>
          <div className="space-y-3">
            {overlaps.map((company) => (
              <div
                key={company.ticker}
                className="p-4 bg-muted/30 rounded border border-border"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{company.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {company.ticker}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Booth {company.booth}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {company.brokers.map((broker) => {
                      const color = BROKER_COLORS[broker as keyof typeof BROKER_COLORS];
                      return (
                        <div
                          key={broker}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {broker.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Coverage Insights</h3>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>KeyBanc Capital Markets</strong> demonstrates the most comprehensive coverage
            with meetings scheduled for{' '}
            {companies.filter(c => c.brokers.includes('KeyBanc Capital Markets')).length} companies,
            representing the deepest institutional engagement at the expo.
          </p>
          {overlaps.length > 0 && (
            <p className="text-muted-foreground">
              <strong>{overlaps.length} companies</strong> are receiving attention from multiple
              brokers, indicating high institutional interest. These include:{' '}
              {overlaps.slice(0, 3).map(c => c.ticker).join(', ')}
              {overlaps.length > 3 && `, and ${overlaps.length - 3} others`}.
            </p>
          )}
          {stats.exclusiveCoverage > 0 && (
            <p className="text-muted-foreground">
              <strong>{stats.exclusiveCoverage} companies</strong> have exclusive coverage from a
              single broker, potentially offering unique access or specialized expertise in those
              relationships.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
