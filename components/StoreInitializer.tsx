"use client";

import { useEffect, useState } from "react";

export function StoreInitializer({ children }: { children: React.ReactNode }) {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	if (!isHydrated) {
		return null; // or a loading spinner
	}

	return <>{children}</>;
}
