"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@neuralpay/ui/components/dialog";
import { Button } from "@neuralpay/ui/components/button";
import { Badge } from "@neuralpay/ui/components/badge";
import { Lock, CheckCircle2, Loader } from "lucide-react";
import { cn } from "@neuralpay/ui/lib/utils";
import { useProviderModal } from "../../hooks/store/use-provider-modal";
import { PROVIDERS } from "../../constants";

export function ProviderSelectModal() {
  const {
    isOpen,
    selectedProvider,
    confirmedProvider,
    closeModal,
    selectProvider,
    confirmProvider,
  } = useProviderModal();

  // After Continue is clicked, confirmedProvider is set and selectedProvider is null
  const isInitializing = confirmedProvider !== null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Connect Your Bank</DialogTitle>
          <DialogDescription>
            Select your preferred provider to securely connect your bank account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-6">
          {PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            return (
              <button
                key={provider.id}
                onClick={() =>
                  !isInitializing &&
                  provider.status !== "coming-soon" &&
                  selectProvider(provider.id)
                }
                disabled={provider.status === "coming-soon" || isInitializing}
                className={cn(
                  "w-full flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all",
                  "hover:border-primary/50",
                  selectedProvider === provider.id &&
                    provider.status !== "coming-soon"
                    ? "border-primary bg-primary/5"
                    : confirmedProvider === provider.id
                      ? "border-primary bg-primary/5"
                      : "border-border",
                  (provider.status === "coming-soon" || isInitializing) &&
                    "cursor-not-allowed opacity-50",
                )}
              >
                <div
                  className={cn(
                    "mt-1 h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                    selectedProvider === provider.id ||
                      confirmedProvider === provider.id
                      ? "border-primary bg-primary"
                      : "border-border",
                  )}
                >
                  {(selectedProvider === provider.id ||
                    confirmedProvider === provider.id) &&
                    provider.status !== "coming-soon" && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                    {provider.status === "recommended" && (
                      <Badge
                        className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 shrink-0 ml-auto"
                        variant="secondary"
                      >
                        Recommended
                      </Badge>
                    )}
                    {provider.status === "coming-soon" && (
                      <Badge
                        className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 shrink-0 ml-auto"
                        variant="secondary"
                      >
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium">Supported regions: </span>
                    {provider.supportedCountries.join(", ")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <Lock className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <span>
              Your credentials are never stored. We use read-only access via
              OAuth for maximum security.
            </span>
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isInitializing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmProvider}
            disabled={!selectedProvider || isInitializing}
            className="flex-1"
          >
            {isInitializing ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Initializing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
