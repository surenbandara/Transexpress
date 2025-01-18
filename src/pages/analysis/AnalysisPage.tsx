import React, { useContext } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { OrderContext } from '../../components/context/OrderProvider';

const TestChart = () => {
    const { orderCount, orderTotal } = useContext(OrderContext);

    const chartSize = 250; 
    const donutSize = 120; 

    const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700'];
    const labels = ['Rejected', 'Pending', 'Delivering', 'Delivered'];

    const countSeries = [orderCount.rejected, orderCount.pending, orderCount.delivering, orderCount.delivered];

    const totalSeries = [orderTotal.rejected, orderTotal.pending, orderTotal.delivering, orderTotal.delivered];

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.chartContainer, styles.orderCountSection]}>
                <Text style={styles.title}>Order Count</Text>
                <PieChart
                    widthAndHeight={chartSize}
                    series={countSeries}
                    sliceColor={colors}
                    coverRadius={donutSize / chartSize}
                    coverFill={'#FFF'}
                />
                <View >
                    {labels.map((label, index) => (
                        <View key={label} style={styles.statsItem}>
                            <View style={[styles.colorIndicator, { backgroundColor: colors[index] }]} />
                            <Text style={styles.statsText}>
                                <Text style={styles.boldText}>{label}:</Text> 
                                {' '}
                                <Text >{countSeries[index]}</Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={[styles.chartContainer, styles.orderTotalSection]}>
                <Text style={styles.title}>Order Total</Text>
                <PieChart
                    widthAndHeight={chartSize}
                    series={totalSeries}
                    sliceColor={colors}
                    coverRadius={donutSize / chartSize}
                    coverFill={'#FFF'}
                />
                <View >
                    {labels.map((label, index) => (
                        <View key={label} style={styles.statsItem}>
                            <View style={[styles.colorIndicator, { backgroundColor: colors[index] }]} />
                            <Text style={styles.statsText}>
                                <Text style={styles.boldText}>{label}:</Text> 
                                {' '}
                                <Text >{`Rs . ${totalSeries[index]}`}</Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        padding: 15,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    orderCountSection: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
    },
    orderTotalSection: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        marginTop: 30, 
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    statsTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    statsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    colorIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 10,
    },
    statsText: {
        fontSize: 18,
        color: '#555',
        fontWeight: 'bold',
    },
    boldText: {
        fontWeight: 'bold',
    },
});

export default TestChart;
