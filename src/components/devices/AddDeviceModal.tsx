import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Laptop, Plus, Sparkles } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import { toast } from "sonner";

export function AddDeviceModal() {
  const { isAddDeviceModalOpen, setAddDeviceModalOpen } = useUIStore();
  const addDevice = useDataStore((s) => s.addDevice);
  const settings = useSettingsStore((s) => s.settings);

  const deviceTypes = settings.devices.deviceTypes;

  const [name, setName] = useState("");
  const [deviceTypeId, setDeviceTypeId] = useState(deviceTypes[0]?.id || "laptop");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]!);
  const [expectedLifeYears, setExpectedLifeYears] = useState(5);
  const [healthPercent, setHealthPercent] = useState(100);

  const handleTypeSelect = (typeId: string) => {
    setDeviceTypeId(typeId);
    const found = deviceTypes.find((t) => t.id === typeId);
    if (found) {
      setExpectedLifeYears(found.expectedLifeYears);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a device name");
      return;
    }

    const selectedType = deviceTypes.find((t) => t.id === deviceTypeId);
    const embodiedCo2 = selectedType?.embodiedCarbonKg || 150;

    addDevice({
      name: name.trim(),
      deviceTypeId,
      serialNumber: serialNumber.trim() || undefined,
      purchaseDate,
      expectedLifeYears,
      currentAgeYears: 0.1,
      healthPercent,
      status: "excellent",
      embodiedCarbonKg: embodiedCo2,
      annualOperationalCarbonKg: 20,
      weightKg: 2.0,
      tags: ["Primary"],
      maintenanceHistory: [],
      lifecycleTimeline: [
        {
          id: `lc-${Date.now()}`,
          date: purchaseDate,
          title: "Hardware Passport Registered",
          type: "purchase",
          description: `Initial baseline of ${embodiedCo2} kg embodied CO₂ registered`,
        },
      ],
      customFieldValues: {},
      checklistAnswers: {},
    });

    setAddDeviceModalOpen(false);
    setName("");
    setSerialNumber("");
  };

  return (
    <Dialog open={isAddDeviceModalOpen} onOpenChange={setAddDeviceModalOpen}>
      <DialogContent className="max-w-md font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-purple-500/10 text-purple-500">
              <Laptop className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Register Hardware Passport</DialogTitle>
              <DialogDescription className="text-xs">
                Track maintenance, battery health, and prevent premature e-waste
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-3.5 text-xs">
          {/* Device Type Select */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Device Category</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {deviceTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  className={`rounded-md border p-2 text-center text-xs font-semibold transition-colors ${
                    deviceTypeId === type.id
                      ? "border-primary bg-primary-soft text-primary font-bold"
                      : "border-border bg-muted/30 hover:bg-muted text-foreground"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="dev-name" className="text-[11px] font-bold">Device Model / Name</Label>
            <Input
              id="dev-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dell XPS 15 / iPhone 15 Pro"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Purchase Date</Label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Expected Life (Years)</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={expectedLifeYears}
                onChange={(e) => setExpectedLifeYears(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="dev-serial" className="text-[11px] font-bold">Serial Number / Asset Tag (Optional)</Label>
            <Input
              id="dev-serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. SN-84920491"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => setAddDeviceModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="font-bold gap-1">
            <Plus className="size-3.5" /> Save Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
