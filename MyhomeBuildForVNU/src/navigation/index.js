import { screenLabels, screenNames } from "../config/screen";
import {
  createStackNavigators,
  createSwitchNavigators,
  createTabNavigators
} from "../../core/navigation";
// import SideBar from "./SideBar";
import TabBar from "./TabBar";
import Login from "../screens/Auth/Login";
import CapNhatSoDienThoai from "../screens/Auth/CapNhatSoDienThoai";

import Main from "../screens/Main/Main";
import DanhSachKhaoSat from "../screens/KhaoSat/DanhSachKhaoSat";
import ChiTietKhaoSat from "../screens/KhaoSat/ChiTietKhaoSat";
import DanhSachGopY from "../screens/GopY/DanhSachGopY";
import ChiTietGopY from "../screens/GopY/ChiTietGopY";
import GuiGopY from "../screens/GopY/GuiGopY";
import DanhSachSoTay from "../screens/SoTay/DanhSachSoTay";
import ChiTietSoTay from "../screens/SoTay/ChiTietSoTay";
import Hotline from "../screens/Hotline/Hotline";
import DanhSachThongBao from "../screens/ThongBao/DanhSachThongBao";
import ChiTietThongBao from "../screens/ThongBao/ChiTietThongBao";
import ThongTinTaiKhoan from "../screens/ThongTinTaiKhoan/ThongTinTaiKhoan";
import ThongTinUngDung from "../screens/ThongTinUngDung/ThongTinUngDung";
import CropImage from "../util/CropImage";
import DangKyTaiKhoan from "../screens/Auth/DangKyTaiKhoan";
import ThemCanHo from "../screens/ThongTinTaiKhoan/themcanho/ThemCanHo";
import DanhSachTinh from "../screens/ThongTinTaiKhoan/themcanho/DanhSachTinh";
import DanhSachHuyen from "../screens/ThongTinTaiKhoan/themcanho/DanhSachHuyen";
import DanhSachChungCu from "../screens/ThongTinTaiKhoan/themcanho/DanhSachChungCu";
import DanhSachToaNha from "../screens/ThongTinTaiKhoan/themcanho/DanhSachToaNha";
import DanhSachTang from "../screens/ThongTinTaiKhoan/themcanho/DanhSachTang";
import CongDong from "../screens/CongDong/CongDong";
import TaoBaiViet from "../screens/CongDong/TaoBaiViet";
import DanhSachCongDong from "../screens/CongDong/DanhSachCongDong";
import SuaBaiViet from "../screens/CongDong/SuaBaiViet";
import ChiTietBaiViet from "../screens/CongDong/ChiTietBaiViet";
import DanhSachSanPhamTrongDanhMuc from "../screens/DichVu/DanhSachSanPhamTrongDanhMuc";
import ChiTietSanPham from "../screens/DichVu/ChiTietSanPham";
import ChiTietDonHang from "../screens/DichVu/DonHang/ChiTietDonHang";
import TaoGianHang from "../screens/DichVu/GianHang/TaoGianHang";
import TaoSanPham from "../screens/DichVu/GianHang/TaoSanPham";
import ChiTietGianHang from "../screens/DichVu/GianHang/ChiTietGianHang";
import DanhSachDonBan from "../screens/DichVu/DonHang/DonBan/DonBan";
import DanhSachDonMua from "../screens/DichVu/DonHang/DonMua/DanhSachDonMua";
import DatHang from "../screens/DichVu/DatHang";
import CodeScanner from "../screens/DichVu/GianHang/CodeScanner";
import DanhSachGoiDichVu from "../screens/DichVu/GoiDichVu/DanhSachGoiDichVu";
import TimKiemSanPham from "../screens/DichVu/TimKiemSanPham";
import LichSuMuaGoiDichVu from "../screens/DichVu/GoiDichVu/LichSuMuaGoiDichVu";
import DanhSachNotification from "../screens/Main/DanhSachNotification";
import DanhSachThanhVien from "../screens/CongDong/DanhSachThanhVien";

const arrStackLogins = [
  { name: screenNames.Login, screen: Login },
  { name: screenNames.CapNhatSoDienThoai, screen: CapNhatSoDienThoai },
  { name: screenNames.DangKySDT, screen: DangKyTaiKhoan },
  { name: screenNames.ThongTinUngDung, screen: ThongTinUngDung }
];

const StackLogins = createStackNavigators(arrStackLogins, {
  navigationOptions: { header: null },
  initialRouteName: screenNames.Login
});

const allTabScreens = [
  {
    key: screenNames.CongDong,
    name: screenNames.CongDong,
    label: screenLabels.TabCongDong,
    icon: "ios-people",
    iconType: "Ionicons",
    screen: CongDong,
    pressColor: "rgba(255, 255, 255, 0.16)"
  },
  {
    key: screenNames.ThongBao,
    name: screenNames.ThongBao,
    label: screenLabels.TabThongBao,
    icon: "ios-mail",
    iconType: "Ionicons",
    screen: DanhSachThongBao,
    pressColor: "rgba(255, 255, 255, 0.16)"
  },
  {
    key: screenNames.KhaoSat,
    name: screenNames.KhaoSat,
    label: screenLabels.TabKhaoSat,
    icon: "ios-list-box",
    iconType: "Ionicons",
    screen: DanhSachKhaoSat,
    pressColor: "rgba(255, 255, 255, 0.16)"
  },
  {
    key: screenNames.GopY,
    name: screenNames.GopY,
    label: screenLabels.TabGopY,
    icon: "ios-chatboxes",
    iconType: "Ionicons",
    screen: DanhSachGopY,
    pressColor: "rgba(255, 255, 255, 0.16)"
  },
  {
    key: screenNames.SoTay,
    name: screenNames.SoTay,
    label: screenLabels.TabSoTay,
    icon: "ios-book",
    iconType: "Ionicons",
    screen: DanhSachSoTay,
    pressColor: "rgba(255, 255, 255, 0.16)"
  }
];

const TabScreens = createTabNavigators(allTabScreens, TabBar);

const arrStackScreens = [
  { name: screenNames.Main, screen: Main },
  { name: screenNames.KhaoSat, screen: DanhSachKhaoSat },
  { name: screenNames.ChiTietKhaoSat, screen: ChiTietKhaoSat },
  { name: screenNames.GopY, screen: DanhSachGopY },
  { name: screenNames.ChiTietGopY, screen: ChiTietGopY },
  { name: screenNames.GuiGopY, screen: GuiGopY },
  { name: screenNames.SoTay, screen: DanhSachSoTay },
  { name: screenNames.ChiTietSoTay, screen: ChiTietSoTay },
  { name: screenNames.Hotline, screen: Hotline },
  { name: screenNames.ThongBao, screen: DanhSachThongBao },
  { name: screenNames.ThongTinTaiKhoan, screen: ThongTinTaiKhoan },
  { name: screenNames.ChiTietThongBao, screen: ChiTietThongBao },
  { name: screenNames.ThongTinUngDung, screen: ThongTinUngDung },
  { name: screenNames.ThemCanHo, screen: ThemCanHo },
  { name: screenNames.DanhSachTinh, screen: DanhSachTinh },
  { name: screenNames.DanhSachHuyen, screen: DanhSachHuyen },
  { name: screenNames.DanhSachChungCu, screen: DanhSachChungCu },
  { name: screenNames.DanhSachToaNha, screen: DanhSachToaNha },
  { name: screenNames.DanhSachTang, screen: DanhSachTang },
  { name: screenNames.DanhSachCongDong, screen: DanhSachCongDong },
  {
    name: screenNames.CropImage,
    screen: CropImage,
    navigationOptions: { gesturesEnabled: false }
  },
  { name: screenNames.TabScreens, screen: TabScreens },
  { name: screenNames.CongDong, screen: CongDong },
  { name: screenNames.TaoBaiViet, screen: TaoBaiViet },
  { name: screenNames.SuaBaiViet, screen: SuaBaiViet },
  { name: screenNames.ChiTietBaiViet, screen: ChiTietBaiViet },
  {
    name: screenNames.DanhSachSanPhamTrongDanhMuc,
    screen: DanhSachSanPhamTrongDanhMuc
  },
  { name: screenNames.ChiTietSanPham, screen: ChiTietSanPham },
  { name: screenNames.ChiTietDonHang, screen: ChiTietDonHang },
  { name: screenNames.TaoGianHang, screen: TaoGianHang },
  { name: screenNames.TaoSanPham, screen: TaoSanPham },
  { name: screenNames.ChiTietGianHang, screen: ChiTietGianHang },
  { name: screenNames.DanhSachDonBan, screen: DanhSachDonBan },
  { name: screenNames.DatHang, screen: DatHang },
  { name: screenNames.DanhSachDonMua, screen: DanhSachDonMua },
  { name: screenNames.CodeScanner, screen: CodeScanner },
  { name: screenNames.DanhSachGoiDichVu, screen: DanhSachGoiDichVu },
  { name: screenNames.LichSuMuaGoiDichVu, screen: LichSuMuaGoiDichVu },
  { name: screenNames.TimKiemSanPham, screen: TimKiemSanPham },
  { name: screenNames.DanhSachNotification, screen: DanhSachNotification },
  { name: screenNames.DanhSachThanhVien, screen: DanhSachThanhVien }
];

const StackScreens = createStackNavigators(arrStackScreens, {
  navigationOptions: { header: null }
});

export default createSwitchNavigators(
  [
    //{ name: screenNames.APP_AUTH_LOADING, screen: AuthLoading },
    { name: screenNames.APP_AUTH_SCREEN, screen: StackLogins },
    { name: screenNames.APP_STACK, screen: StackScreens }
  ],
  {
    initialRouteName: screenNames.APP_AUTH_SCREEN
  }
);
