import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Vehicle, RootStackParamList } from '../types';
import vehicleService from '../services/vehicleService';
import { getStatusColor, getBatteryColor } from '../utils/statusColors';

type NavigationProp = StackNavigationProp<RootStackParamList, 'VehicleList'>;

interface Props {
  navigation: NavigationProp;
}

const STATUS_FILTERS = ['all', 'active', 'charging', 'maintenance', 'inactive'];

export const VehicleListScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchVehicles = useCallback(
    async (pageNumber = 1, isRefresh = false, statusFilter = selectedStatus) => {
      try {
        setError(null);
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageNumber === 1) {
          setLoading(true);
        }

        const params: any = {
          page: pageNumber,
          limit: 20,
        };

        if (statusFilter && statusFilter !== 'all') {
          params.status = statusFilter;
        }

        const response = await vehicleService.getAll(params);

        const newVehicles = response.data || [];
        if (isRefresh || pageNumber === 1) {
          setVehicles(newVehicles);
        } else {
          setVehicles((prev) => [...prev, ...newVehicles]);
        }

        if (response.pagination) {
          setHasMore(pageNumber < response.pagination.pages);
        } else {
          setHasMore(false);
        }
        setPage(pageNumber);
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicles');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedStatus]
  );

  useEffect(() => {
    fetchVehicles(1, false, selectedStatus);
  }, [fetchVehicles, selectedStatus]);

  const onRefresh = () => {
    fetchVehicles(1, true, selectedStatus);
  };

  const onEndReached = () => {
    if (!loading && !refreshing && hasMore) {
      fetchVehicles(page + 1, false, selectedStatus);
    }
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
  };

  // Real-time client search filter (by Registration Number, Model, or Fleet Name)
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) {
      return vehicles;
    }
    const q = searchQuery.toLowerCase().trim();
    return vehicles.filter((item) => {
      const regMatch = item.registrationNumber?.toLowerCase().includes(q);
      const modelMatch = item.model?.toLowerCase().includes(q);
      const fleetName =
        typeof item.fleet === 'object' && item.fleet ? item.fleet.name : '';
      const fleetMatch = fleetName.toLowerCase().includes(q);
      return regMatch || modelMatch || fleetMatch;
    });
  }, [vehicles, searchQuery]);

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    const statusConfig = getStatusColor(item.status);
    const batteryColor = getBatteryColor(item.batteryLevel);
    const fleetName =
      typeof item.fleet === 'object' && item.fleet ? item.fleet.name : 'Unassigned Fleet';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('VehicleDetail', {
            vehicleId: item._id,
            registrationNumber: item.registrationNumber,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.registrationNumber}>{item.registrationNumber}</Text>
            <Text style={styles.modelName}>{item.model}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bg },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusConfig.dot },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: statusConfig.text },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.fleetBadge}>
            <Text style={styles.fleetText}>🏢 {fleetName}</Text>
          </View>

          <View style={styles.batteryContainer}>
            <Text style={styles.batteryIcon}>🔋</Text>
            <View style={styles.batteryBarBg}>
              <View
                style={[
                  styles.batteryBarFill,
                  {
                    width: `${Math.max(5, item.batteryLevel)}%`,
                    backgroundColor: batteryColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.batteryPercentage, { color: batteryColor }]}>
              {item.batteryLevel}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* ── App Bar Header with Logo & Brand ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.headerLogo}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.headerLogoImg}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>Evify Fleet</Text>
              <Text style={styles.headerSubtitle}>
                {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} active
              </Text>
            </View>
          </View>
        </View>

        {/* ── Search Input ── */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Reg No, Model, or Fleet..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Horizontal Status Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_FILTERS.map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => handleStatusSelect(status)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Error Banner ── */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchVehicles(1, false, selectedStatus)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Vehicle List or Loading ── */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Fetching EV fleet telemetry...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10B981']}
              tintColor="#10B981"
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedStatus !== 'all'
                  ? 'No Matching Vehicles Found'
                  : 'No Vehicles Available'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedStatus !== 'all'
                  ? 'Try adjusting your search query or filter tags.'
                  : 'Pull down to refresh or register vehicles in the admin panel.'}
              </Text>
              {(searchQuery || selectedStatus !== 'all') && (
                <TouchableOpacity
                  style={styles.resetFilterBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                  }}
                >
                  <Text style={styles.resetFilterBtnText}>Reset Search & Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLogoImg: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  registrationNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  modelName: {
    fontSize: 14,
    color: '#475569',
    marginTop: 3,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fleetBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fleetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryIcon: {
    fontSize: 14,
  },
  batteryBarBg: {
    width: 48,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryPercentage: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetFilterBtn: {
    marginTop: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default VehicleListScreen;
