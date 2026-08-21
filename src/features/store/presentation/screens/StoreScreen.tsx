import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { darkTheme } from '../../../../shared/theme';

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

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-store'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/store');
      if (Array.isArray(data)) return data as Product[];
      if (Array.isArray(data.products)) return data.products as Product[];
      if (Array.isArray(data.data)) return data.data as Product[];
      if (Array.isArray(data.items)) return data.items as Product[];
      return [] as Product[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await apiClient.post('/athlete/store/purchase', { productId, quantity: 1 });
      return data;
    },
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
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={darkTheme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>TIENDA</Text>
            <Text style={styles.title}>Store</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={darkTheme.colors.primary} />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyCenter}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyDash}>—</Text>
            </View>
            <Text style={styles.emptyTitle}>Tienda vacia</Text>
            <Text style={styles.emptyText}>Tu coach habilitara productos aqui cuando esten disponibles.</Text>
          </View>
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
                  <Pressable
                    style={({ pressed }) => [
                      styles.addBtn,
                      pressed && { opacity: 0.8 },
                      (purchaseMutation.isPending || (p.stock ?? 1) <= 0) && styles.addBtnDisabled,
                    ]}
                    onPress={() => purchaseMutation.mutate(p.id)}
                    disabled={purchaseMutation.isPending || (p.stock ?? 1) <= 0}
                    accessibilityLabel={`Agregar ${p.name}`}
                  >
                    {purchaseMutation.isPending ? (
                      <ActivityIndicator size="small" color={darkTheme.colors.primary} />
                    ) : (
                      <Text style={styles.addBtnText}>{(p.stock ?? 1) <= 0 ? 'Sin stock' : 'Agregar'}</Text>
                    )}
                  </Pressable>
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
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { padding: 24, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  headerText: { flex: 1, gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2.5, color: darkTheme.colors.primary },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: darkTheme.colors.text },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '500', color: darkTheme.colors.textSecondary },
  emptyCenter: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDash: { fontSize: 22, fontWeight: '400', color: darkTheme.colors.textSecondary, lineHeight: 22 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: darkTheme.colors.text, marginTop: 4 },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    overflow: 'hidden',
  },
  imageArea: {
    height: 120,
    backgroundColor: '#151515',
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,140,61,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,140,61,0.25)',
  },
  imagePlaceholderText: { fontSize: 20, fontWeight: '400', color: darkTheme.colors.textSecondary, lineHeight: 20 },
  cardBody: { padding: 12, gap: 4 },
  productName: { fontSize: 14, fontWeight: '600', color: darkTheme.colors.text, lineHeight: 18 },
  brandText: { fontSize: 11, fontWeight: '400', color: darkTheme.colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  priceText: { fontSize: 16, fontWeight: '700', color: darkTheme.colors.primary },
  stockText: { fontSize: 11, fontWeight: '400', color: darkTheme.colors.textSecondary },
  addBtn: {
    marginTop: 10,
    height: 28,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,140,61,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,61,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { fontSize: 12, fontWeight: '600', color: darkTheme.colors.primary },
});
