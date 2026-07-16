import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSmartFridgeOverviewFn } from './-smartfridge.functions';

export const Route = createFileRoute(
  '/_auth/machines/$machineId/smartfridge/'
)({
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ['smartfridge-overview', params.machineId],
      queryFn: () =>
        getSmartFridgeOverviewFn({ data: { machineId: params.machineId } }),
    });
  },
  component: SmartFridgeOverviewPage,
});

function formatWeight(valueDg: number | null) {
  return valueDg == null ? '—' : `${(valueDg / 10).toFixed(1)} g`;
}

function SmartFridgeOverviewPage() {
  const { machineId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ['smartfridge-overview', machineId],
    queryFn: () => getSmartFridgeOverviewFn({ data: { machineId } }),
  });

  const onlineShelves = data.shelves.filter((shelf) => shelf.lastSeenAt).length;
  const calibratedShelves = data.shelves.filter(
    (shelf) => shelf.calibrationValid
  ).length;
  const faultedShelves = data.shelves.filter(
    (shelf) => shelf.faultMask !== 0 || shelf.currentFaultCode !== 0
  ).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">SmartFridge</p>
        <h1 className="text-3xl font-semibold">{data.machineName}</h1>
        <p className="text-sm text-muted-foreground">
          Serial {data.serialNumber} · CAN {data.canBitrate / 1000} kbit/s ·
          protocol {data.protocolMajor}.{data.protocolMinor}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Shelves" value={`${data.shelves.length}`} />
        <SummaryCard label="Seen" value={`${onlineShelves}`} />
        <SummaryCard label="Calibrated" value={`${calibratedShelves}`} />
        <SummaryCard label="Faults" value={`${faultedShelves}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Commissioning</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <dt className="text-muted-foreground">Setup completed</dt>
            <dd>{data.setupCompleted ? 'Yes' : 'No'}</dd>
            <dt className="text-muted-foreground">Customer operation</dt>
            <dd>{data.customerOperationEnabled ? 'Enabled' : 'Disabled'}</dd>
            <dt className="text-muted-foreground">Expected shelves</dt>
            <dd>{data.expectedShelfCount}</dd>
            <dt className="text-muted-foreground">Last online</dt>
            <dd>
              {data.lastOnlineAt
                ? new Date(data.lastOnlineAt).toLocaleString('hr-HR')
                : 'Never'}
            </dd>
          </dl>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Responsibility split</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The local fridge app owns CAN communication, recognition,
            calibration, refill and active shopping sessions. This web app owns
            the shared product catalogue, remote configuration, reporting and
            synchronized history.
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="font-semibold">Shelf status</h2>
          <p className="text-sm text-muted-foreground">
            Rows are physical SmartFridge shelves, not Lockbox compartments.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Shelf</th>
                <th className="p-3">CAN</th>
                <th className="p-3">Layout</th>
                <th className="p-3">Product</th>
                <th className="p-3">Current</th>
                <th className="p-3">Baseline</th>
                <th className="p-3">Calibration</th>
                <th className="p-3">Fault</th>
              </tr>
            </thead>
            <tbody>
              {data.shelves.map((shelf) => (
                <tr key={shelf.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">
                      {shelf.displayName ?? `UID ${shelf.deviceUid}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {shelf.lastSeenAt
                        ? `Seen ${new Date(shelf.lastSeenAt).toLocaleString('hr-HR')}`
                        : 'Not seen'}
                    </div>
                  </td>
                  <td className="p-3">{shelf.currentCanAddress}</td>
                  <td className="p-3">
                    {shelf.rowNumber == null || shelf.columnNumber == null
                      ? 'Unmapped'
                      : `R${shelf.rowNumber} / C${shelf.columnNumber}`}
                  </td>
                  <td className="p-3">
                    <div>{shelf.productName ?? 'Unassigned'}</div>
                    {shelf.nominalWeightDg != null && (
                      <div className="text-xs text-muted-foreground">
                        {formatWeight(shelf.nominalWeightDg)} ±{' '}
                        {formatWeight(shelf.matchingToleranceDg)}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {shelf.currentWeightValid
                      ? formatWeight(shelf.currentTotalWeightDg)
                      : 'Invalid'}
                  </td>
                  <td className="p-3">
                    {shelf.baselineValid
                      ? formatWeight(shelf.storedBaselineWeightDg)
                      : 'Missing'}
                  </td>
                  <td className="p-3">
                    {shelf.calibrationValid ? 'Valid' : 'Missing'}
                  </td>
                  <td className="p-3">
                    {shelf.faultMask === 0 && shelf.currentFaultCode === 0
                      ? 'None'
                      : `0x${shelf.currentFaultCode.toString(16).padStart(2, '0')}`}
                  </td>
                </tr>
              ))}
              {data.shelves.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No shelves synchronized yet. Run recognition in the local
                    fridge app first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
