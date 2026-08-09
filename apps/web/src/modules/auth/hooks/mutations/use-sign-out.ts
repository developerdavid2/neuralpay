"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/trpc-client";

export function useSignOut() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		...trpc.users.auth.signOut.mutationOptions(),
		onSuccess: () => {
			queryClient.clear();
			router.replace("/auth/signin");
		},
	});
}
