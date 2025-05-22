"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrightDataBalance } from "@/hooks/admin/useBrighDataBalance";
import { useProxyCurlBalance } from "@/hooks/admin/useProxyCurlBalance";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatCredits = (amount: number | undefined): string => {
  if (amount === undefined) return "";
  return new Intl.NumberFormat("en-US").format(amount) + " credits";
};

const isLowBrightDataBalance = (amount: number | undefined): boolean => {
  if (amount === undefined || amount <= 0) return false;
  return amount < 2;
};

const isLowProxyCurlBalance = (amount: number | undefined): boolean => {
  if (amount === undefined || amount <= 0) return false;
  return amount < 10;
};

const ApiUsagePage = () => {
  const router = useRouter();
  const { data: brightDataBalance, isLoading: isLoadingBrightData } =
    useBrightDataBalance();
  const { data: proxyCurlBalance, isLoading: isLoadingProxyCurl } =
    useProxyCurlBalance();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              API Usage & Credits
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of third-party API balances and usage.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                BrightData Balance
              </CardTitle>
              <Link
                href="https://www.brightdata.com/dashboard"
                target="_blank"
                className="flex items-center text-primary hover:text-primary/80"
              >
                <ExternalLink size={16} />
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingBrightData ? (
                <Skeleton className="h-10 w-1/2" />
              ) : (
                <div
                  className={`text-3xl font-bold ${
                    isLowBrightDataBalance(brightDataBalance)
                      ? "text-red-300"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(brightDataBalance)}
                </div>
              )}
              {isLowBrightDataBalance(brightDataBalance) && (
                <Alert variant="destructive" className="mt-4 py-2">
                  <AlertTitle className="text-sm font-medium">Low balance</AlertTitle>
                  <AlertDescription className="text-xs">
                    You have less than 2$ USD remaining. Please top up your
                    balance.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* ProxyCurl Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                ProxyCurl Credits
              </CardTitle>
              <Link
                href="https://nubela.co/proxycurl/dashboard/proxycurl-api/api-key/"
                target="_blank"
                className="flex items-center text-primary hover:text-primary/80"
              >
                <ExternalLink size={16} />
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingProxyCurl ? (
                <Skeleton className="h-10 w-3/4" />
              ) : (
                <div
                  className={`text-3xl font-bold ${
                    isLowProxyCurlBalance(proxyCurlBalance)
                      ? "text-red-300"
                      : "text-green-600"
                  }`}
                >
                  {formatCredits(proxyCurlBalance)}
                </div>
              )}
              {isLowProxyCurlBalance(proxyCurlBalance) && (
                <Alert variant="destructive" className="mt-4 py-2">
                  <AlertTitle className="text-sm font-medium">Low balance</AlertTitle>
                  <AlertDescription className="text-xs">
                    You have less than 10 credits remaining. Please top up your
                    account.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiUsagePage;
