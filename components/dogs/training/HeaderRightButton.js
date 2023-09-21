import { TouchableOpacity, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const HeaderRightButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ marginRight: 15, flexDirection: 'row' }}>
          <Ionicons name="add" size={30} color="black" />
  </TouchableOpacity>
);

export default HeaderRightButton;
