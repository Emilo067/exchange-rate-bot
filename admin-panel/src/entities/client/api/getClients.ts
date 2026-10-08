import { getEdgeFunction } from '../../../shared/api/edgeFunction'; import type { Client } from '../model/types';
export const getClients = async (): Promise<Client[]> => (await getEdgeFunction<{clients: Client[]}>('get-clients')).clients;
