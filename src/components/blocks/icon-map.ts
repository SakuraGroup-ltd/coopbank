// Curated lucide icons editors can pick by name in Studio. CMS stores the
// string key; components resolve it here. Adding an icon = one line.
import {
  PiggyBank, CreditCard, Banknote, Tractor, Smartphone, Users, MapPin,
  BarChart3, Globe, Calculator, Store, Send, Receipt, Shield, Bell, QrCode,
  ShoppingCart, Zap, Briefcase, Car, Building2, Target, Eye, Heart,
  Lightbulb, TrendingUp, Award, Phone, Mail, Clock, HelpCircle, Landmark,
  Fingerprint, Wallet, CircleDot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  PiggyBank, CreditCard, Banknote, Tractor, Smartphone, Users, MapPin,
  BarChart3, Globe, Calculator, Store, Send, Receipt, Shield, Bell, QrCode,
  ShoppingCart, Zap, Briefcase, Car, Building2, Target, Eye, Heart,
  Lightbulb, TrendingUp, Award, Phone, Mail, Clock, HelpCircle, Landmark,
  Fingerprint, Wallet,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

export function iconOf(name?: string | null): LucideIcon {
  return (name && ICONS[name]) || CircleDot;
}
