import React, { useContext, useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Order, OrderType } from '../../utils/Model';
import { createPathToImage, invokeCall, invokeMapWithNavigation } from '../../utils/Services';
import { OrderContext } from '../context/OrderProvider';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useNavigation } from '@react-navigation/native';

interface CustomModalProps {
  order: Order;
  visible: boolean;
  onClose: () => void;
}

const InfoPopup: React.FC<CustomModalProps> = ({ order, visible, onClose }) => {
  const [editableOrder, setEditableOrder] = useState(order);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const { updateOrder } = useContext(OrderContext);
  const navigation = useNavigation();

  useEffect(() => {
    setEditableOrder(order);
  }, [order]);

  useEffect(() => {
    const backAction = () => {
      if (fullImageVisible) {
        setFullImageVisible(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [fullImageVisible]);

  const showEditModal = () => {
    onClose();
    navigation.navigate('Edit Record', { fetchOrder: order });
  };

  const handleNav = () => { invokeMapWithNavigation(editableOrder.address); };
  
  const handleSave = async (orderType: OrderType) => {
    if (editableOrder.orderType === OrderType.REJECTED) {
      updateOrder({ ...editableOrder, orderType: orderType, rejectReason: undefined });
    } else {
      updateOrder({ ...editableOrder, orderType: orderType });
    }
    if (orderType === OrderType.DELIVERED) {
      navigation.navigate('GeoLocationConfirmation', { order: order });
    }
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose} // Close modal when clicking outside
      >
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modal} // Prevent closing the modal when clicking inside
            onPress={() => {}} // Prevents propagation to the outer touchable
          >
            {/* Header Section with ID and Name */}
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <Text style={styles.idText}>ID: {editableOrder.id}</Text>
                <Text style={styles.nameText}>{editableOrder.name}</Text>
              </View>
              <TouchableOpacity onPress={showEditModal} style={styles.iconButton}>
                <Icon name="pencil" size={20} color="#728282" />
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            <ScrollView contentContainerStyle={styles.scrollView}>
              {/* Table-Like Information */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{editableOrder.date}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <TouchableOpacity style={styles.touchableText} onPress={handleNav}>
                  <Text style={styles.infoValue}>{editableOrder.address}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Numbers:</Text>
                <View style={styles.numbersContainer}>
                  {editableOrder.numbers.map((number, index) => (
                    <TouchableOpacity key={index} style={styles.touchableText} onPress={() => invokeCall(number)}>
                      <Text style={styles.infoValue}>{number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Price:</Text>
                <Text style={styles.infoValue}>Rs.{editableOrder.COD}</Text>
              </View>

              {/* Additional Information */}
              {(editableOrder.notes || editableOrder.rejectReason) && (
                <>
                  {editableOrder.notes && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Note:</Text>
                      <Text style={styles.infoValue}>{editableOrder.notes}</Text>
                    </View>
                  )}
                  {editableOrder.rejectReason && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Reject Reason:</Text>
                      <Text style={styles.infoValue}>{editableOrder.rejectReason}</Text>
                    </View>
                  )}
                </>
              )}

              {/* Image Display */}
              {editableOrder.photo == true && (
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => setFullImageVisible(true)}>
                    <Image
                      source={{ uri: createPathToImage(order.id) }}
                      style={styles.image}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Full Image Modal */}
            {editableOrder.photo == true && (
              <Modal
                visible={fullImageVisible}
                transparent={true}
                onRequestClose={() => setFullImageVisible(false)}
              >
                <ImageViewer
                  imageUrls={[{ url: createPathToImage(order.id) }]}
                  enableImageZoom={true}
                  onClick={() => {}}
                />
              </Modal>
            )}

            {/* Button Section */}
            <View style={styles.buttonContainer}>
              {editableOrder.orderType !== OrderType.DELIVERED && (
                editableOrder.orderType === OrderType.DELIVERING ? (
                  <TouchableOpacity style={styles.inactiveButton} onPress={() => handleSave(OrderType.PENDING)}>
                    <Text style={styles.buttonText}>Inactive</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.activeButton} onPress={() => handleSave(OrderType.DELIVERING)}>
                    <Text style={styles.buttonText}>Active</Text>
                  </TouchableOpacity>
                )
              )}
              {editableOrder.orderType !== OrderType.DELIVERED && (
                <TouchableOpacity style={styles.deliveredButton} onPress={() => handleSave(OrderType.DELIVERED)}>
                  <Text style={styles.buttonText}>Delivered</Text>
                </TouchableOpacity>
              )}
              {editableOrder.orderType === OrderType.DELIVERED && (
                <TouchableOpacity style={styles.inactiveButton} onPress={() => handleSave(OrderType.PENDING)}>
                  <Text style={styles.buttonText}>Inactive</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modal: {
    width: 300,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  headerContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  idText: {
    fontSize: 14,
    color: '#888',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  iconButton: {
    marginLeft: 10, // Adjust margin for spacing
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  infoValue: {
    color: '#555'
  },
  touchableText: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1, 
    borderBottomColor: '#555'
  },
  numbersContainer: {
    flex: 1,
    alignItems: 'flex-end', 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  deliveredButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  inactiveButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default InfoPopup;
