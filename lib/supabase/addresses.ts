import { supabase } from './client';
import { Address, SupabaseResponse } from './types';

/**
 * Add a new blockchain address for a user
 * @param userId User's UUID
 * @param address Blockchain address
 * @param blockchain Blockchain name (e.g., 'ethereum', 'bitcoin')
 * @returns Promise with the created address or error
 */
export async function addAddress(
  userId: string,
  address: string,
  blockchain: string
): Promise<SupabaseResponse<Address>> {
  try {
    const newAddress = {
      user_id: userId,
      address,
      blockchain,
      added_at: new Date().toISOString(),
      transaction_count: 0,
    };

    const { data, error } = await supabase
      .from('addresses')
      .insert([newAddress])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as Address,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to add address: ${errorMessage}` },
    };
  }
}

/**
 * Get all addresses for a specific user
 * @param userId User's UUID
 * @returns Promise with an array of addresses or error
 */
export async function getUserAddresses(userId: string): Promise<SupabaseResponse<Address[]>> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as Address[],
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to get user addresses: ${errorMessage}` },
    };
  }
}

/**
 * Get a specific address by ID
 * @param addressId Address UUID
 * @returns Promise with the address or error
 */
export async function getAddressById(addressId: string): Promise<SupabaseResponse<Address>> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as Address,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to get address: ${errorMessage}` },
    };
  }
}

/**
 * Update the transaction count for an address
 * @param addressId Address UUID
 * @param transactionCount New transaction count
 * @returns Promise with the updated address or error
 */
export async function updateAddressTransactionCount(
  addressId: string,
  transactionCount: number
): Promise<SupabaseResponse<Address>> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .update({ transaction_count: transactionCount })
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as Address,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to update transaction count: ${errorMessage}` },
    };
  }
}

/**
 * Delete an address
 * @param addressId Address UUID
 * @returns Promise with success status or error
 */
export async function deleteAddress(addressId: string): Promise<SupabaseResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: true,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to delete address: ${errorMessage}` },
    };
  }
}

/**
 * Check if an address already exists for a user
 * @param userId User's UUID
 * @param address Blockchain address
 * @returns Promise with boolean indicating if address exists
 */
export async function addressExists(
  userId: string,
  address: string
): Promise<SupabaseResponse<boolean>> {
  try {
    const { error, count } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('address', address);

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: count !== null && count > 0,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to check if address exists: ${errorMessage}` },
    };
  }
} 