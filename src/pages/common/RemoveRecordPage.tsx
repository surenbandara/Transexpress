import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, Keyboard } from 'react-native';
import { Order, OrderType, RejectReasons, RootStackParamList } from '../../utils/Model';
import { OrderContext } from '../../components/context/OrderProvider';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import DeleteConfirmationPopup from '../../components/popups/DeleteConfirmationPopup';

type RemoveRecordPageRouteProp = RouteProp<RootStackParamList, 'RemoveRecordPage'>;

export const RemoveRecordPage: React.FC = () => {
  const route = useRoute<RemoveRecordPageRouteProp>();
  const navigation = useNavigation();
  const { fetchOrder } = route.params;

  const { updateOrder, deleteOrder } = useContext(OrderContext);
  const [order, setOrder] = useState<Order>(fetchOrder);
  const [selectedReason, setSelectedReason] = useState<RejectReasons>(
    Object.values(RejectReasons).includes(order.rejectReason as RejectReasons)
      ? (order.rejectReason as RejectReasons)
      : RejectReasons.OUT_CITY
  );
  const [customReason, setCustomReason] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [isDeleteConfirmation, setDeleteConfirmation] = useState(false);
  const closeDeleteConfirmationModal = () => setDeleteConfirmation(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setOrder(fetchOrder);

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [fetchOrder]);

  const handleSaveReason = async () => {
    const reason = selectedReason === RejectReasons.OTHER ? customReason : selectedReason;
    updateOrder({ ...order, rejectReason: reason, orderType: OrderType.REJECTED });
    navigation.goBack();
  };

  const handleRemove = () => {
    setDeleteConfirmation(true);
  };

  const handleDelete = () => {
    deleteOrder(order);
    setDeleteConfirmation(false);
    navigation.goBack();
  };

  const handleSelectReason = (reason: RejectReasons) => {
    setSelectedReason(reason);
    if (reason === RejectReasons.OTHER) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      setCustomReason('');
    }
  };

  return (
    <>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: keyboardHeight }]}
          keyboardShouldPersistTaps='handled'
          ref={scrollViewRef}
        >
          <Text style={styles.label}>Select or Enter Reason:</Text>
          {Object.values(RejectReasons).map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonButton,
                selectedReason === reason && styles.selectedButton,
              ]}
              onPress={() => handleSelectReason(reason as RejectReasons)}
            >
              <Text
                style={[
                  styles.reasonText,
                  selectedReason === reason && styles.selectedText,
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
          {selectedReason === RejectReasons.OTHER && (
            <TextInput
              style={styles.input}
              value={customReason}
              onChangeText={(text) => setCustomReason(text)}
              placeholder="Enter custom reason"
              placeholderTextColor="#555" 
              onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            />
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveReason}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    <DeleteConfirmationPopup visible={isDeleteConfirmation} onClose={closeDeleteConfirmationModal} handleDelete={handleDelete} order={order} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 18,
    color: '#555'
  },
  reasonButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  reasonText: {
    color: '#000',
  },
  selectedText: {
    color: 'white',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 5,
    color: '#555'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#28a745', 
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  removeButton: {
    backgroundColor: '#dc3545', 
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RemoveRecordPage;
