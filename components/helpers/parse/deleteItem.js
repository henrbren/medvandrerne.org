import { Alert } from 'react-native';
import Parse from 'parse/react-native';
import { localize } from "@translations/localize";


export const deleteItem = async (objectId, parseClass, readData, closeModal) => {
    Alert.alert(
        localize('main.meta.deleteTitle'),
        localize('main.meta.deleteQuestion'),
       [
         {
           text:  localize('main.meta.cancel'),
           onPress: () => console.log('Cancel Pressed'), 
           style: 'cancel',
         },
         {
           text: 'OK',
           onPress: async () => {
             const PARSE_CLASS = Parse.Object.extend(parseClass);
             const query = new Parse.Query(PARSE_CLASS);
   
             try {
               const object = await query.get(objectId);
               await object.destroy();
               await readData();
               closeModal()
              
             } catch (error) {
               Alert.alert(localize('main.meta.error'), error.message);
               closeModal()
             }
           },
         },
       ],
       { cancelable: false }
     );
};
