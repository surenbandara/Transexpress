import React, { useContext, useState } from "react";
import { OrderContext } from "../../components/context/OrderProvider";
import { excelPicker, pdfPicker } from "../../utils/Services";
import { dbUtils } from "../../utils/DbUtils";
import { Icon } from "react-native-elements";
import { ActivityIndicator, Modal, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import SuccessPopup from "../../components/popups/SuccessfulPopup";

const UploadOrders = () => {
    const { initializeOrders } = useContext(OrderContext);
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleUpload = async () => {
        try {
            setLoading(true);
            const content = await excelPicker();
            console.log(content);
            if (content.length !== 0) {
                await dbUtils.deleteAllOrdersAndImages();
                await dbUtils.saveOrders(content);
                initializeOrders(content);
                setShowSuccessPopup(true);
            }
        } catch (error) {
            console.error('Error during upload:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleUpload} style={styles.uploadButton}>
                <Icon
                    name="upload"
                    type="font-awesome"
                    size={50}
                    color="#007bff"
                />
                <Text style={styles.uploadText}>Upload .xlsx, .csv file</Text>
            </TouchableOpacity>
            {loading && (
                <Modal transparent={true} animationType="none" visible={loading}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.loadingText}>Processing Excel...</Text>
                    </View>
                </Modal>
            )}
            <SuccessPopup visible={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    uploadButton: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 0,
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    uploadText: {
        marginTop: 10,
        fontSize: 16,
        color: '#007bff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#ffffff',
    },
});

export default UploadOrders;
