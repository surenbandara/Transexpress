import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, BackHandler, Image } from 'react-native';
import { Order, OrderType } from '../../utils/Model';
import Icon from 'react-native-vector-icons/FontAwesome';
import InfoPopup from '../popups/InfoPopup';
import { captureImage, createPathToImage } from '../../utils/Services';
import { dbUtils } from '../../utils/DbUtils';
import { OrderContext } from '../context/OrderProvider';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';

interface TicketProps {
  order: Order
};

const OrderTicket: React.FC<TicketProps> = ({ order }) => {
  const { updateOrder } = useContext(OrderContext);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    setCurrentOrder(order);
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


  const showReasonModal = () => { navigation.navigate('Reschedule/Return Record', { fetchOrder: order }); }

  const showInfoModal = () => setInfoVisible(true);
  const closeInfoModal = () => setInfoVisible(false);

  const handlePickImage = async () => {
    const imageData = await captureImage();
    if (imageData) {
      await dbUtils.storeImage(imageData, order.id);
      setCurrentOrder({ ...currentOrder, photo: true });
      updateOrder({ ...currentOrder, photo: true });
    }
  }

  return (
    <>
      <View style={styles.ticketContainer}>
        <View style={styles.row}>
          {order.photo == true ? (
            <TouchableOpacity onPress={() => setFullImageVisible(true)} style={styles.imageContainer}>
              <Image
                source={{ uri: createPathToImage(order.id) }}
                style={styles.image}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handlePickImage}>
              <Icon name="archive" size={30} color="#728282" />
            </TouchableOpacity>
          )}

          <Modal
            visible={fullImageVisible}
            transparent={true}
            onRequestClose={() => setFullImageVisible(false)}
          >
            <ImageViewer
              imageUrls={[{ url: createPathToImage(order.id) }]}
              onClick={() => {}}
              enableImageZoom={true}
            />
          </Modal>

          <TouchableOpacity onPress={showInfoModal} style={styles.detailsContainer}>
            <Text style={styles.nameText}>{order.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>Rs.{order.COD}</Text>
              <View style={styles.iconContainer}>
                {order.orderType !== OrderType.DELIVERED && (
                  <TouchableOpacity onPress={showReasonModal} style={styles.iconButton}>
                    <Icon name="trash" size={25} color="#728282" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={styles.addressText}>{order.address}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <InfoPopup visible={isInfoVisible} onClose={closeInfoModal} order={currentOrder} />
    </>
  );
};


const styles = StyleSheet.create({
  ticketContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rejectTicketContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#e8aba9',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    flexShrink: 1, 
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  text: {
    color: '#000',
    lineHeight: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6080b3', 
    marginBottom: 0,
    lineHeight: 22, 
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555', 
    marginBottom: 0, 
    lineHeight: 20, 
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 0, 
    lineHeight: 20, 
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginHorizontal: 10,
    marginRight: 15
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});


export default memo(OrderTicket);
