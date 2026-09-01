import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listStore, purchaseProduct } from '../../storeService';
import { colors } from '../../../../shared/theme/tokens';
import { ScreenHeader } from '../../../../shared/components/ui/ScreenHeader';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  brand?: string;
  imageUrl?: string;
};

export function StoreScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-store'],
    queryFn: listStore,
    staleTime: 2 * 60 * 1000,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => purchaseProduct(productId, 1),
    onSuccess: () => {
      Alert.alert('Success', 'Producto agregado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['athlete-store'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'No se pudo completar la compra.';
      Alert.alert('Error', msg);
    },
  });

  const products = data ?? [];
  const isEmpty = !isLoading && products.length === 0;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Store" onBack={() => navigation.goBack()} />

        {isLoading ? (
          <EmptyState variant="loading" message="Cargando productos..." />
        ) : isEmpty ? (
          <EmptyState variant="empty" message="Tu coach habilitara productos aqui cuando esten disponibles." />
        ) : (
          <View style={styles.grid}>
            {products.map((p) => (
              <View key={p.id} style={styles.card}>
                {/* Image area */}
                <View style={styles.imageArea}>
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>—</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {p.name}
                  </Text>
                  {!!p.brand && (
                    <Text style={styles.brandText} numberOfLines={1}>
                      {p.brand}
                    </Text>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>${Number(p.price).toFixed(2)}</Text>
                    <Text style={styles.stockText}>Stock: {p.stock ?? '—'}</Text>
                  </View>
                  <PrimaryButton
                    label={(p.stock ?? 1) <= 0 ? 'Sin stock' : 'Agregar'}
                    onPress={() => purchaseMutation.mutate(p.id)}
                    disabled={purchaseMutation.isPending || (p.stock ?? 1) <= 0}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: 24, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageArea: {
    height: 120,
    backgroundColor: colors.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  imagePlaceholderText: { fontSize: 20, fontWeight: '400', color: colors.textSecondary, lineHeight: 20 },
  cardBody: { padding: 12, gap: 4 },
  productName: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 18 },
  brandText: { fontSize: 11, fontWeight: '400', color: colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  priceText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  stockText: { fontSize: 11, fontWeight: '400', color: colors.textSecondary },
});
