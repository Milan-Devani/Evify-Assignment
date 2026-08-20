import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Vehicle, RootStackParamList } from '../types';
import vehicleService from '../services/vehicleService';
import { getStatusColor, getBatteryColor } from '../utils/statusColors';

type VehicleDetailRouteProp = RouteProp<RootStackParamList, 'VehicleDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'VehicleDetail'>;

interface Props {
  route: VehicleDetailRouteProp;
  navigation: NavigationProp;
}

export const VehicleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleService.getOne(vehicleId);
      setVehicle(response.data);
    } catch (err: any) {
      setError(err.message || 'Could not fetch vehicle details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [vehicleId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading vehicle specifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !vehicle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Error Loading Vehicle</Text>
          <Text style={styles.errorSubtitle}>{error || 'Vehicle not found'}</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={fetchDetail}>
            <Text style={styles.btnPrimaryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusColor(vehicle.status);
  const batteryColor = getBatteryColor(vehicle.batteryLevel);
  const fleetName =
    typeof vehicle.fleet === 'object' && vehicle.fleet
      ? vehicle.fleet.name
      : 'Unassigned Fleet';
  const fleetDesc =
    typeof vehicle.fleet === 'object' && vehicle.fleet
      ? vehicle.fleet.description
      : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.registrationLarge}>{vehicle.registrationNumber}</Text>
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
                {vehicle.status}
              </Text>
            </View>
          </View>

          <Text style={styles.modelNameLarge}>{vehicle.model}</Text>

          {/* Battery Status Block */}
          <View style={styles.batteryBlock}>
            <View style={styles.batteryHeader}>
              <Text style={styles.batteryLabel}>Battery Level</Text>
              <Text style={[styles.batteryValue, { color: batteryColor }]}>
                {vehicle.batteryLevel}%
              </Text>
            </View>
            <View style={styles.batteryTrack}>
              <View
                style={[
                  styles.batteryFill,
                  {
                    width: `${Math.max(5, vehicle.batteryLevel)}%`,
                    backgroundColor: batteryColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Fleet Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fleet Assignment</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned Fleet</Text>
            <Text style={styles.infoValue}>{fleetName}</Text>
          </View>
          {fleetDesc ? (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Fleet Scope</Text>
              <Text style={styles.infoValueSubtle}>{fleetDesc}</Text>
            </View>
          ) : null}
        </View>

        {/* Maintenance & Notes Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operations & Maintenance</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Maintenance</Text>
            <Text style={styles.infoValue}>
              {vehicle.lastMaintenance
                ? new Date(vehicle.lastMaintenance).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Not Recorded'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Operational Notes</Text>
            <Text style={styles.infoNotes}>
              {vehicle.notes || 'No active notes or maintenance remarks.'}
            </Text>
          </View>
        </View>

        {/* System Timestamps Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>System Audit Trail</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>System ID</Text>
            <Text style={styles.infoCode}>{vehicle._id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created At</Text>
            <Text style={styles.infoValue}>
              {vehicle.createdAt
                ? new Date(vehicle.createdAt).toLocaleString()
                : '—'}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>
              {vehicle.updatedAt
                ? new Date(vehicle.updatedAt).toLocaleString()
                : '—'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registrationLarge: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  modelNameLarge: {
    fontSize: 16,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  batteryBlock: {
    marginTop: 20,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
  },
  batteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  batteryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  batteryTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  infoValueSubtle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  infoNotes: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  infoCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#475569',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  btnPrimary: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default VehicleDetailScreen;
