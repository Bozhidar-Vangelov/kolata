export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          locale: string;
          push_subscription: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          locale?: string;
          push_subscription?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          locale?: string;
          push_subscription?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cars: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          make: string | null;
          model: string | null;
          year: number | null;
          license_plate: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          license_plate?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          license_plate?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cars_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      insurance: {
        Row: {
          id: string;
          car_id: string;
          company: string;
          start_date: string;
          end_date: string;
          price: number;
          notify_10_days: boolean;
          notify_5_days: boolean;
          notify_1_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          company: string;
          start_date: string;
          end_date: string;
          price: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          company?: string;
          start_date?: string;
          end_date?: string;
          price?: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insurance_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      kasko: {
        Row: {
          id: string;
          car_id: string;
          company: string;
          start_date: string;
          end_date: string;
          type: "cash_payout" | "partner_service";
          free_roadside: boolean;
          price: number;
          notify_10_days: boolean;
          notify_5_days: boolean;
          notify_1_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          company: string;
          start_date: string;
          end_date: string;
          type: "cash_payout" | "partner_service";
          free_roadside?: boolean;
          price: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          company?: string;
          start_date?: string;
          end_date?: string;
          type?: "cash_payout" | "partner_service";
          free_roadside?: boolean;
          price?: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kasko_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      technical_inspection: {
        Row: {
          id: string;
          car_id: string;
          start_date: string;
          end_date: string;
          price: number;
          notify_10_days: boolean;
          notify_5_days: boolean;
          notify_1_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          start_date: string;
          end_date: string;
          price: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          start_date?: string;
          end_date?: string;
          price?: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "technical_inspection_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      oil_change: {
        Row: {
          id: string;
          car_id: string;
          change_date: string;
          current_km: number;
          next_change_km: number;
          oil_type: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          change_date: string;
          current_km: number;
          next_change_km: number;
          oil_type: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          change_date?: string;
          current_km?: number;
          next_change_km?: number;
          oil_type?: string;
          price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oil_change_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      vignette: {
        Row: {
          id: string;
          car_id: string;
          start_date: string;
          end_date: string;
          price: number;
          notify_10_days: boolean;
          notify_5_days: boolean;
          notify_1_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          start_date: string;
          end_date: string;
          price: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          start_date?: string;
          end_date?: string;
          price?: number;
          notify_10_days?: boolean;
          notify_5_days?: boolean;
          notify_1_day?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vignette_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      tires: {
        Row: {
          id: string;
          car_id: string;
          season: "winter" | "summer" | "all_season";
          year: number | null;
          brand: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          season: "winter" | "summer" | "all_season";
          year?: number | null;
          brand?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          season?: "winter" | "summer" | "all_season";
          year?: number | null;
          brand?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tires_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_log: {
        Row: {
          id: string;
          user_id: string;
          record_type: string;
          record_id: string;
          days_before: number;
          channel: "push" | "email";
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          record_type: string;
          record_id: string;
          days_before: number;
          channel: "push" | "email";
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          record_type?: string;
          record_id?: string;
          days_before?: number;
          channel?: "push" | "email";
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
