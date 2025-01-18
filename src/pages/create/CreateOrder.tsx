import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Order, OrderType } from '../../utils/Model';
import { OrderContext } from '../../components/context/OrderProvider';
import { captureImage, createPathToImage } from '../../utils/Services';
import { dbUtils } from '../../utils/DbUtils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import SuccessPopup from '../../components/popups/SuccessfulPopup';

export const CreateRecordPage: React.FC = () => {
  const { insertOrder } = useContext(OrderContext);
  const [editableOrder, setEditableOrder] = useState<Order>({
    COD: 0,
    address: "",
    date: "",
    id: "",
    name: "",
    numbers: [],
    orderType: OrderType.PENDING,
    photo: false,
    updatedAt: Date.now(),
    notes: "",
    rejectReason: ""
  });
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSave = () => {
    if (editableOrder) {
      insertOrder(editableOrder);
      setShowSuccessPopup(true); 
      setEditableOrder({
        COD: 0,
        address: "",
        date: "",
        id: "",
        name: "",
        numbers: [],
        orderType: OrderType.PENDING,
        photo: false,
        updatedAt: Date.now(),
        notes: "",
        rejectReason: ""
      });
      setTimeout(() => {setShowSuccessPopup(false)}, 1000);
    }
  };

  const handlePickImage = async () => {
    const imageData = await captureImage();
    if (imageData && editableOrder) {
      await dbUtils.storeImage(imageData, editableOrder.id);
      const updatedAt = Date.now();
      setEditableOrder({ ...editableOrder, photo: true, updatedAt: updatedAt });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          enableOnAndroid
        >
          <Text style={styles.label}>Id:</Text>
          <TextInput
            style={styles.input}
            value={editableOrder.id}
            onChangeText={(text) => setEditableOrder({ ...editableOrder, id: text })}
          />
          <Text style={styles.label}>Date:</Text>
          <TextInput
            style={styles.input}
            value={editableOrder.date}
            onChangeText={(text) => setEditableOrder({ ...editableOrder, date: text })}
          />
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            value={editableOrder.name}
            onChangeText={(text) => setEditableOrder({ ...editableOrder, name: text })}
          />
          <Text style={styles.label}>Address:</Text>
          <TextInput
            style={styles.input}
            value={editableOrder.address}
            onChangeText={(text) => setEditableOrder({ ...editableOrder, address: text })}
          />
          <Text style={styles.label}>Numbers:</Text>
          <TextInput
            style={styles.input}
            value={editableOrder.numbers.join(', ')}
            onChangeText={(text) => setEditableOrder({ ...editableOrder, numbers: text.split(', ').map(num => num.trim()) })}
          />
          <Text style={styles.label}>Price:</Text>
          <TextInput
            style={styles.input}
            value={`Rs : ${editableOrder.COD?.toString()}`}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setEditableOrder({ ...editableOrder, COD: numericValue ? parseInt(numericValue, 10) : 0 });
            }}
            keyboardType="numeric"
          />

          {/* Package Image Section */}
          <Text style={styles.label}>Package Image:</Text>
          <Modal
            visible={fullImageVisible}
            transparent={true}
          >
            <TouchableOpacity onPress={() => setFullImageVisible(false)} style={styles.modalBackground}>
              {editableOrder.photo == true && (
                <Image
                  source={{ uri: createPathToImage(editableOrder.id) }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </Modal>
          <View style={styles.imageContainer}>
            {editableOrder.photo == true && (
              <TouchableOpacity onPress={() => setFullImageVisible(true)}>
                <Image
                  source={{ uri: createPathToImage(editableOrder.id) }}
                  style={styles.image}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.plusIcon} onPress={handlePickImage}>
              <Icon name="add-circle" size={30} color="#007bff" />
            </TouchableOpacity>
          </View>

          {/* Note Section */}
          <Text style={styles.label}>Add Note:</Text>
          <TextInput
            style={styles.input}
            value={editableOrder.notes}
            onChangeText={(text) => setEditableOrder({ ...editableOrder, notes: text })}
            placeholder="Enter your note here"
            placeholderTextColor="#555"
            multiline
          />
        </KeyboardAwareScrollView>

        {/* Save and Cancel Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Add New Record</Text>
          </TouchableOpacity>
        </View>

        {/* Success Popup */}
        <SuccessPopup visible={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} />
      </View>
    </KeyboardAvoidingView>
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
    color: '#555'
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 5,
    color: '#555'
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  plusIcon: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

export default CreateRecordPage;
