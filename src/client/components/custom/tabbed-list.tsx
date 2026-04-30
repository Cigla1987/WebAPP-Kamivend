import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/client/components/ui/card';
import { DataTable } from '#/client/components/ui/data-table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#/client/components/ui/tabs';
import type { ColumnDef } from '@tanstack/react-table';
interface Tab<T> {
  label: string;
  value: string;
  filterFn?: (data: T[]) => T[];
  title?: string;
  description?: string;
}
interface TabbedListProps<T> {
  data: T[];
  tabs: Tab<T>[];
  columns: ColumnDef<T>[] | ((data: T[]) => ColumnDef<T>[]);
  defaultTab?: string;
  actions?: React.ReactNode;
}
function TabbedList<T>({
  data,
  tabs,
  columns,
  defaultTab = 'all',
  actions,
}: TabbedListProps<T>) {
  return (
    <div className="container mx-auto pb-10">
      <main className="py-4 pr-6 pl-4 sm:py-0">
        <Tabs defaultValue={defaultTab}>
          <div className="flex items-center">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {actions && (
              <div className="ml-auto flex items-center gap-2">{actions}</div>
            )}
          </div>
          {tabs.map((tab) => {
            const tabData = tab.filterFn ? tab.filterFn(data) : data;
            // Generate columns based on filtered data if columns is a function
            const tabColumns =
              typeof columns === 'function' ? columns(tabData) : columns;

            return (
              <TabsContent key={tab.value} value={tab.value}>
                <Card>
                  {(tab.title || tab.description) && (
                    <CardHeader>
                      {tab.title && <CardTitle>{tab.title}</CardTitle>}
                      {tab.description && (
                        <CardDescription>{tab.description}</CardDescription>
                      )}
                    </CardHeader>
                  )}
                  <CardContent>
                    <DataTable columns={tabColumns} data={tabData} />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
export default TabbedList;
