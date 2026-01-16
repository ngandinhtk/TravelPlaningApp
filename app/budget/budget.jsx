import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PieChart from 'react-native-pie-chart'; // Assuming this library is installed
import BackButton from '../../components/common/BackButton';
import Loading from '../../components/common/Loading';
import CustomModal from '../../components/common/Modal';
import { useTrip } from '../../context/TripContext';
import { updateTrip } from '../../services/tripService';


// Define categories as per the markdown
const CATEGORIES = {
  'Accommodation': { color: '#f39c12', icon: '🏨' },
  'Food': { color: '#e74c3c', icon: '🍜' },
  'Transportation': { color: '#3498db', icon: '🚗' },
  'Activities': { color: '#9b59b6', icon: '🎫' },
  'Shopping': { color: '#2ecc71', icon: '💰' },
  'Other': { color: '#95a5a6', icon: '💸' },
};

const BudgetScreen = () => {
  // const router = useRouter();
  const { trip, setTrip } = useTrip();
  const [expenses, setExpenses] = useState(trip?.expenses || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
  const [analysisData, setAnalysisData] = useState([]);
  const [showRecommended, setShowRecommended] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState(Object.keys(CATEGORIES)[0]);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');

  useEffect(() => {
    if (trip?.expenses) {
      setExpenses(trip.expenses);
    }
  }, [trip]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBudget = useMemo(() => {
    return (trip?.budget || 0) - totalSpent;
  }, [trip, totalSpent]);

  const expensesByCategory = useMemo(() => {
    const grouped = {};
    Object.keys(CATEGORIES).forEach(cat => {
      grouped[cat] = 0;
    });
    expenses.forEach(expense => {
      if (grouped[expense.category] !== undefined) {
        grouped[expense.category] += expense.amount;
      }
    });
    return grouped;
  }, [expenses]);

  const recommendedRatios = {
    'Accommodation': 0.30,
    'Food': 0.25,
    'Transportation': 0.20,
    'Activities': 0.15,
    'Shopping': 0.05,
    'Other': 0.05,
  };

  const displayedExpenses = useMemo(() => {
    if (showRecommended && trip?.budget) {
      const recommended = {};
      Object.keys(CATEGORIES).forEach(cat => {
        recommended[cat] = trip.budget * (recommendedRatios[cat] || 0.05);
      });
      return recommended;
    }
    return expensesByCategory;
  }, [expensesByCategory, showRecommended, trip]);

  const chartSeries = useMemo(() => {
    const data = Object.entries(displayedExpenses)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        value,
        color: CATEGORIES[key].color,
      }));
    return data.length > 0 ? data : [{ value: 1, color: '#E0E0E0' }];
  }, [displayedExpenses]);

  const filteredExpenses = useMemo(() => {
    if (filterCategory === 'All') return expenses;
    return expenses.filter(e => e.category === filterCategory);
  }, [expenses, filterCategory]);

  if (!trip) {
    return <Loading message="Đang tải thông tin ngân sách..." />;
  }

  const handleAddExpense = async () => {
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    if (!newExpenseDescription) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả cho chi tiêu.');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      amount,
      category: newExpenseCategory,
      description: newExpenseDescription,
      date: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);

    // Check for over budget
    if (remainingBudget - amount < 0) {
        Alert.alert('Cảnh báo', 'Bạn đã vượt quá ngân sách dự kiến!');
    }

    try {
      await updateTrip(trip.id, { expenses: updatedExpenses });
      setTrip({ ...trip, expenses: updatedExpenses });
    } catch (error) {
      console.error('Failed to save expense:', error);
      Alert.alert('Lỗi', 'Không thể lưu chi tiêu. Vui lòng thử lại.');
    }

    // Reset and close modal
    setNewExpenseAmount('');
    setNewExpenseDescription('');
    setNewExpenseCategory(Object.keys(CATEGORIES)[0]);
    setIsModalVisible(false);
  };

  const handleAnalyzeBudget = () => {
    if (!trip?.budget) return;

    const analysis = Object.keys(CATEGORIES).map(cat => {
      const ratio = recommendedRatios[cat] || 0.05;
      const allocated = trip.budget * ratio;
      const spent = expensesByCategory[cat] || 0;
      const remaining = allocated - spent;
      
      return {
        category: cat,
        allocated,
        spent,
        remaining,
        ratio
      };
    });

    setAnalysisData(analysis);
    setIsAnalysisVisible(true);
  };

  const renderCategoryPicker = () => (
    <View style={styles.categoryPickerContainer}>
      {Object.keys(CATEGORIES).map(cat => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.categoryChip,
            { backgroundColor: CATEGORIES[cat].color },
            newExpenseCategory === cat && styles.categoryChipSelected
          ]}
          onPress={() => setNewExpenseCategory(cat)}
        >
          <Text style={styles.categoryChipText}>{CATEGORIES[cat].icon} {cat}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          filterCategory === 'All' && styles.filterChipSelected,
        ]}
        onPress={() => setFilterCategory('All')}
      >
        <Text style={[styles.filterChipText, filterCategory === 'All' && styles.filterChipTextSelected]}>Tất cả</Text>
      </TouchableOpacity>
      {Object.keys(CATEGORIES).map(cat => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.filterChip,
            filterCategory === cat && { backgroundColor: CATEGORIES[cat].color, borderWidth: 0 }
          ]}
          onPress={() => setFilterCategory(cat)}
        >
          <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextSelected]}>
            {CATEGORIES[cat].icon} {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseItemIcon}>
        <Text>{CATEGORIES[item.category]?.icon || '💸'}</Text>
      </View>
      <View style={styles.expenseItemDetails}>
        <Text style={styles.expenseItemDescription}>{item.description}</Text>
        <Text style={styles.expenseItemCategory}>{item.category}</Text>
      </View>
      <Text style={styles.expenseItemAmount}>
        -{item.amount.toLocaleString('vi-VN')}đ
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
              <BackButton />
              <Text style={styles.headerTitle}> Theo dõi ngân sách </Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
      

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Tổng ngân sách</Text>
            <Text style={styles.summaryValuePrimary}>{(trip.budget || 0).toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Đã chi</Text>
            <Text style={styles.summaryValueDanger}>{totalSpent.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Còn lại</Text>
            <Text style={[styles.summaryValue, remainingBudget < 0 && styles.summaryValueDanger]}>
              {remainingBudget.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Analysis Button */}
        <TouchableOpacity style={styles.analysisButton} onPress={handleAnalyzeBudget}>
          <Text style={styles.analysisButtonText}>📊 {showRecommended ? 'Xem chi tiết phân tích' : 'Phân tích & Gợi ý chi tiêu'}</Text>
        </TouchableOpacity>

        {/* Pie Chart & Category Breakdown */}
        <View style={styles.chartSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{showRecommended ? 'Ngân sách đề xuất' : 'Phân tích chi tiêu'}</Text>
            {showRecommended && (
              <TouchableOpacity onPress={() => setShowRecommended(false)}>
                <Text style={{ color: '#667eea', fontSize: 12 }}>Hoàn tác</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.pieChartContainer}>
            {expenses.length > 0 || showRecommended ? (
              <PieChart
                widthAndHeight={180}
                series={chartSeries}
                coverRadius={0.6}
                coverFill={'#F8F9FA'}
              />
            ) : (
                <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartText}>Chưa có chi tiêu</Text>
                </View>
            )}
          </View>
          <View style={styles.legendContainer}>
            {Object.entries(displayedExpenses).map(([category, amount]) => {
              if (amount > 0) {
                const total = showRecommended ? trip.budget : totalSpent;
                const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
                return (
                  <View key={category} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: CATEGORIES[category].color }]} />
                    <Text style={styles.legendText}>{category} ({percentage}%)</Text>
                    <Text style={styles.legendAmount}>{amount.toLocaleString('vi-VN')}đ</Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>Danh sách chi tiêu</Text>
          {renderFilterChips()}
          {filteredExpenses.length === 0 ? (
            <Text style={styles.emptyText}>{expenses.length === 0 ? 'Chưa có chi tiêu nào được ghi lại.' : 'Không có chi tiêu trong danh mục này.'}</Text>
          ) : (
            <FlatList
              data={filteredExpenses}
              renderItem={renderExpenseItem}
              keyExtractor={item => item.id}
              scrollEnabled={false} // Disable scrolling for inner list
            />
          )}
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <CustomModal
        visible={isModalVisible}
        title="Thêm chi tiêu mới"
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleAddExpense}
        confirmText="Thêm"
      >
        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Số tiền (VD: 50000)"
            keyboardType="numeric"
            value={newExpenseAmount}
            onChangeText={setNewExpenseAmount}
          />
          <TextInput
            style={styles.input}
            placeholder="Mô tả (VD: Ăn trưa, vé tham quan...)"
            value={newExpenseDescription}
            onChangeText={setNewExpenseDescription}
          />
          <Text style={styles.modalLabel}>Chọn danh mục:</Text>
          {renderCategoryPicker()}
        </View>
      </CustomModal>

      {/* Analysis Modal */}
      <CustomModal
        visible={isAnalysisVisible}
        title="Gợi ý phân bổ ngân sách"
        onClose={() => setIsAnalysisVisible(false)}
        onConfirm={() => {
          setShowRecommended(true);
          setIsAnalysisVisible(false);
        }}
      >
        <ScrollView style={{ maxHeight: 400 }}>
          <Text style={styles.analysisHint}>
            Dựa trên ngân sách {trip.budget?.toLocaleString('vi-VN')}đ của bạn:
          </Text>
          {analysisData.map((item) => (
            <View key={item.category} style={styles.analysisItem}>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisCategory}>{CATEGORIES[item.category].icon} {item.category} ({(item.ratio * 100)}%)</Text>
                <Text style={{ color: item.remaining < 0 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                  {item.remaining < 0 ? 'Vượt mức' : 'Tốt'}
                </Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Đề xuất: {item.allocated.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.analysisLabel}>Thực tế: {item.spent.toLocaleString('vi-VN')}đ</Text>
              </View>
              <Text style={[styles.analysisResult, { color: item.remaining < 0 ? '#e74c3c' : '#27ae60' }]}>
                {item.remaining < 0 ? `Đã vượt: ${Math.abs(item.remaining).toLocaleString('vi-VN')}đ` : `Còn lại: ${item.remaining.toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
          ))}
        </ScrollView>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  summaryLabel: { fontSize: 13, color: '#666', marginBottom: 5 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#27ae60' },
  summaryValuePrimary: { fontSize: 16, fontWeight: '700', color: '#667eea' },
  summaryValueDanger: { fontSize: 16, fontWeight: '700', color: '#e74c3c' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  analysisButton: { backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  analysisButtonText: { color: '#667eea', fontWeight: 'bold', fontSize: 16 },
  analysisHint: { fontSize: 14, color: '#666', marginBottom: 15, fontStyle: 'italic' },
  analysisItem: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  analysisHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  analysisCategory: { fontWeight: 'bold', color: '#333' },
  analysisRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  analysisLabel: { fontSize: 12, color: '#666' },
  analysisResult: { fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'right' },
  chartSection: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, alignItems: 'center' },
  pieChartContainer: { marginBottom: 20 },
  emptyChart: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center' },
  emptyChartText: { color: '#999' },
  legendContainer: { width: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  legendColor: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendText: { fontSize: 14, color: '#333', flex: 1 },
  legendAmount: { fontSize: 14, fontWeight: '600', color: '#666' },
  expensesSection: { marginBottom: 20 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
  expenseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  expenseItemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  expenseItemDetails: { flex: 1 },
  expenseItemDescription: { fontSize: 15, fontWeight: '600', color: '#333' },
  expenseItemCategory: { fontSize: 12, color: '#777', marginTop: 2 },
  expenseItemAmount: { fontSize: 16, fontWeight: 'bold', color: '#e74c3c' },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  fabIcon: { fontSize: 30, color: '#fff' },
  modalContent: { paddingHorizontal: 10 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 15 },
  modalLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  categoryPickerContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, margin: 5, borderWidth: 2, borderColor: 'transparent' },
  categoryChipSelected: { borderColor: '#333' },
  categoryChipText: { color: '#fff', fontWeight: 'bold' },
  filterContainer: { marginBottom: 15 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipSelected: {
    backgroundColor: '#34495e',
    borderWidth: 0,
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    // padding: 12,
    fontSize: 16,
  },
});

export default BudgetScreen;
