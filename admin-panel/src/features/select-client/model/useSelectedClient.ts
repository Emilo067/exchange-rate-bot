import { useState } from 'react'; export const useSelectedClient = () => useState<string | null>(null);
