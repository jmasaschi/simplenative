import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './utils/supabase';

const Tab = createBottomTabNavigator();
const colors = {
  background: '#F6F7F2',
  surface: '#FFFFFF',
  text: '#1D2925',
  muted: '#68736D',
  border: '#E1E6DF',
  accent: '#26745A',
  accentLight: '#E6F2EB',
  danger: '#B42318',
};

function Page({ children }) {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

function ActionButton({ title, onPress, secondary = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        secondary && styles.secondaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionButtonText, secondary && styles.secondaryButtonText]}>
        {title}
      </Text>
    </Pressable>
  );
}

function HomeScreen({ navigation }) {
  return (
    <Page>
      <View style={styles.hero}>
        <Text style={styles.heroMark}>S</Text>
        <Text style={styles.eyebrow}>DAILY COUNTER</Text>
        <Text style={styles.heroTitle}>A little snapshot of your day.</Text>
        <Text style={styles.heroText}>
          Keep track of the weather and what you served, one day at a time.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What would you like to do?</Text>
        <Text style={styles.cardDescription}>
          Add today’s numbers or look back at previous sales.
        </Text>
        <ActionButton title="Record today’s sales" onPress={() => navigation.navigate('Record')} />
        <ActionButton
          title="View sales history"
          secondary
          onPress={() => navigation.navigate('Sales')}
        />
      </View>
    </Page>
  );
}

function NumericField({ label, value, onChangeText, allowNegative = false }) {
  const handleChange = (text) => {
    const pattern = allowNegative ? /^-?\d*$/ : /^\d*$/;
    if (pattern.test(text)) onChangeText(text);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        keyboardType={allowNegative ? 'default' : 'number-pad'}
        placeholder="0"
        placeholderTextColor="#A0AAA3"
        selectTextOnFocus
      />
    </View>
  );
}

function RecordScreen() {
  const [degrees, setDegrees] = useState('');
  const [iceCream, setIceCream] = useState('');
  const [coffee, setCoffee] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const saveSales = async () => {
    const values = [degrees, iceCream, coffee];
    if (values.some((value) => value === '' || value === '-')) {
      setMessage('Enter a whole number in each field to continue.');
      return;
    }

    const [temperature, iceCreamCount, coffeeCount] = values.map(Number);
    if (
      temperature < -32768 ||
      temperature > 32767 ||
      iceCreamCount < 0 ||
      iceCreamCount > 2147483647 ||
      coffeeCount < 0 ||
      coffeeCount > 2147483647
    ) {
      setMessage('Temperature must fit an int2 and sales counts must fit non-negative int4 values.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase.from('sales').insert({
        degC: temperature,
        ice_cream_sales: iceCreamCount,
        coffee_sales: coffeeCount,
        sales_date: new Date().toISOString(),
      });

      if (error) {
        setMessage(`Could not save sales: ${error.message}`);
        return;
      }

      setDegrees('');
      setIceCream('');
      setCoffee('');
      setMessage('Sales recorded successfully.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setMessage(`Could not save sales: ${detail}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Page>
        <SectionTitle
          eyebrow="NEW ENTRY"
          title="Record sales"
          description="Add the day’s temperature and sales counts."
        />
        <View style={styles.card}>
          <View style={styles.dateNote}>
            <Text style={styles.dateLabel}>RECORDING DATE</Text>
            <Text style={styles.dateValue}>
              {new Date().toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
            <Text style={styles.dateHint}>Saved automatically when you submit.</Text>
          </View>
          <NumericField
            label="Temperature (°C)"
            value={degrees}
            onChangeText={setDegrees}
            allowNegative
          />
          <NumericField
            label="Ice cream sales"
            value={iceCream}
            onChangeText={setIceCream}
          />
          <NumericField label="Coffee sales" value={coffee} onChangeText={setCoffee} />
          {message ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.formMessage, message.startsWith('Could not') && styles.errorText]}
            >
              {message}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: saving }}
            disabled={saving}
            onPress={saveSales}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          >
            {saving ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.submitButtonText}>Save today’s sales</Text>
            )}
          </Pressable>
        </View>
      </Page>
    </KeyboardAvoidingView>
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadSales = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('created_at, degC, ice_cream_sales, coffee_sales, sales_date')
        .order('sales_date', { ascending: false });

      if (error) {
        setErrorMessage(`Could not load sales: ${error.message}`);
      } else {
        setSales(data ?? []);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Could not load sales: ${detail}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [loadSales]),
  );

  const renderSale = (item) => (
    <View style={styles.tableRow}>
      <View style={[styles.cell, styles.dateCell]}>
        <Text style={styles.dateText}>{formatDate(item.sales_date)}</Text>
        <Text style={styles.timeText}>{formatTime(item.sales_date)}</Text>
      </View>
      <Text style={[styles.cell, styles.temperatureCell]}>{item.degC}°C</Text>
      <Text style={[styles.cell, styles.salesCell]}>{item.ice_cream_sales}</Text>
      <Text style={[styles.cell, styles.salesCell]}>{item.coffee_sales}</Text>
    </View>
  );

  return (
    <Page>
      <SectionTitle
        eyebrow="YOUR RECORDS"
        title="Sales history"
        description="A day-by-day look at temperature and sales."
      />
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : errorMessage ? (
          <View style={styles.emptyState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <ActionButton title="Try again" onPress={loadSales} secondary />
          </View>
        ) : sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.cardTitle}>No sales recorded yet</Text>
            <Text style={styles.cardDescription}>
              Your saved daily records will appear here.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.tableHint}>Swipe to see all columns</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.headerCell, styles.dateCell, styles.dateHeader]}>
                    Date & time
                  </Text>
                  <Text style={[styles.headerCell, styles.temperatureCell]}>Temp (°C)</Text>
                  <Text style={[styles.headerCell, styles.salesCell]}>Ice cream</Text>
                  <Text style={[styles.headerCell, styles.salesCell]}>Coffee</Text>
                </View>
                {sales.map((item, index) => (
                  <React.Fragment key={`${item.created_at}-${index}`}>
                    {renderSale(item)}
                  </React.Fragment>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Page>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.muted,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            sceneStyle: { backgroundColor: colors.background },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Record" component={RecordScreen} />
          <Tab.Screen name="Sales" component={SalesScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.background },
  pageContent: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { marginBottom: 22 },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  hero: {
    backgroundColor: colors.accentLight,
    borderRadius: 24,
    padding: 24,
    minHeight: 255,
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroMark: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    color: colors.surface,
    fontSize: 22,
    fontWeight: '700',
    height: 48,
    lineHeight: 48,
    marginBottom: 24,
    overflow: 'hidden',
    textAlign: 'center',
    width: 48,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 38,
    maxWidth: 310,
  },
  heroText: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  cardDescription: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButtonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  secondaryButton: { backgroundColor: colors.accentLight },
  secondaryButtonText: { color: colors.accent },
  pressed: { opacity: 0.78 },
  dateNote: {
    backgroundColor: colors.accentLight,
    borderRadius: 13,
    marginBottom: 20,
    padding: 15,
  },
  dateLabel: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  dateValue: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 6 },
  dateHint: { color: colors.muted, fontSize: 12, marginTop: 4 },
  field: { marginBottom: 16 },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#FBFCFA',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  formMessage: { color: colors.accent, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  errorText: { color: colors.danger },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 4,
  },
  submitButtonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  loader: { paddingVertical: 28 },
  emptyState: { alignItems: 'center', paddingVertical: 16 },
  tableHint: { color: colors.muted, fontSize: 12, marginBottom: 10 },
  table: { width: 474 },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 58,
  },
  tableHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 0,
    minHeight: 46,
  },
  headerCell: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  dateHeader: { textAlign: 'left' },
  cell: {
    color: colors.text,
    flexShrink: 0,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  dateCell: { alignItems: 'flex-start', width: 158 },
  temperatureCell: { width: 92 },
  salesCell: { width: 112 },
  dateText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  timeText: { color: colors.muted, fontSize: 11, marginTop: 3 },
  tabBar: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingTop: 7 },
  tabLabel: { fontSize: 12, fontWeight: '600' },
});
