"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DangerZoneCard() {
  return (
    <Card className="rounded-xl border border-red-300 bg-red-50 text-red-900 shadow-sm">
      <CardHeader className="border-b border-red-200 py-4">
        <div>
          <div className="text-sm font-semibold">Danger zone</div>
          <div className="text-xs text-red-700">Delete your account and all associated data</div>
        </div>
      </CardHeader>
      <CardContent className="rounded-b-xl pb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-red-800">
            This action is permanent. You will lose access to your workout plans and history.
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account</AlertDialogTitle>
                <AlertDialogDescription>
                  This is not wired yet. In a future version this will delete your account and workout data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Understood</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
