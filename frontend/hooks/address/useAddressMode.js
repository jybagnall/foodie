import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADDRESS_MODE } from "../../components/pages/userDashboard/address/address.constants";

export default function useAddressMode({
  addresses,
  isFetching,
  isDirty,
  isValid,
}) {
  const navigate = useNavigate();

  const [mode, setMode] = useState(ADDRESS_MODE.CREATE);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (!isFetching && addresses.length > 0) {
      setMode(ADDRESS_MODE.SELECT);
    }
  }, [isFetching, addresses]); // 불러온 주소의 목록이 있다면 선택 모드로

  useEffect(() => {
    if (addresses.length === 1 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]); // 주소가 1개 있다면 미리 선택

  const isSelecting = mode === ADDRESS_MODE.SELECT;
  const isCreating = mode === ADDRESS_MODE.CREATE;
  const isEditing = mode === ADDRESS_MODE.EDIT;

  const canSubmitSelect = isSelecting && !!selectedAddressId;
  const canSubmitEdit = isEditing && isDirty && isValid;
  const canSubmitCreate = isCreating && isValid;
  const isAddressReady = canSubmitSelect || canSubmitEdit || canSubmitCreate;

  const exitAddressForm = () => {
    if (isEditing) {
      setMode(ADDRESS_MODE.SELECT);
      setSelectedAddressId(null);
    } else if (isCreating && addresses.length > 0) {
      setMode(ADDRESS_MODE.SELECT);
    } else {
      navigate("/cart");
    }
  };

  const editAddress = (addressId) => {
    setMode(ADDRESS_MODE.EDIT);
    setSelectedAddressId(addressId);
  };

  const createAddress = () => {
    setMode(ADDRESS_MODE.CREATE);
    setSelectedAddressId(null); // 새 주소 입력 시 기존 선택 해제
  };

  const selectAddress = (addressId) => {
    setMode(ADDRESS_MODE.SELECT);
    setSelectedAddressId(addressId);
  };

  return {
    mode,
    selectedAddressId,
    editAddress,
    createAddress,
    selectAddress,
    exitAddressForm,
    isSelecting,
    isEditing,
    isCreating,
    isAddressReady,
  };
}
