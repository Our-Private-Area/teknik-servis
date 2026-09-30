namespace TeknikPro.API.Models;

public class ServiceRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? TenantId { get; set; } = "demo-servis";
    public string TrackingNo { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? AssignedStaffId { get; set; }
    public string? AssignedStaffName { get; set; }

    public string DeviceType { get; set; } = string.Empty;
    public string DeviceBrand { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string? SerialNo { get; set; }
    public string? Imei { get; set; }
    public string? DevicePassword { get; set; }

    public string Complaint { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public string? PerformedWork { get; set; }
    public string Status { get; set; } = "received";
    public string Priority { get; set; } = "normal";

    public decimal EstimatedCost { get; set; }
    public decimal LaborCost { get; set; }
    public decimal PartsCost { get; set; }
    public decimal TotalCost { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string PaymentStatus { get; set; } = "pending";
    public string? PaymentMethod { get; set; }
    public bool IsWarranty { get; set; }

    public List<string> AccessoriesReceived { get; set; } = new();
    public string? PhysicalCondition { get; set; }

    public List<StatusHistoryItem> StatusHistory { get; set; } = new();

    public bool IsOnlineBooking { get; set; } = false;
    public string? DeliveryMethod { get; set; }
    public string? PreferredAppointmentDate { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }

    public DateTime? ReceivedDate { get; set; } = DateTime.UtcNow;
    public DateTime? EstimatedDeliveryDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class StatusHistoryItem
{
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string UpdatedBy { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class Customer
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? TenantId { get; set; } = "demo-servis";
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxId { get; set; }
    public string? Notes { get; set; }
    public int TotalServices { get; set; }
    public decimal Balance { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class StockItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? TenantId { get; set; } = "demo-servis";
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public int Quantity { get; set; }
    public int CriticalLevel { get; set; }
    public string Unit { get; set; } = "Adet";
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public string? ShelfLocation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CashTransaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Type { get; set; } = "income"; // income | expense
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "cash";
    public string? ServiceTrackingNo { get; set; }
    public string? RecordedBy { get; set; }
    public string? TenantId { get; set; } = "demo-servis";
    public DateTime Date { get; set; } = DateTime.UtcNow;
}

public class TenantTheme
{
    public string PrimaryColor { get; set; } = "#0071e3";
    public string SecondaryColor { get; set; } = "#34c759";
    public string? AccentColor { get; set; }
    public string? BackgroundColor { get; set; }
    public string? TextColor { get; set; }
    public string? GradientFrom { get; set; }
    public string? GradientTo { get; set; }
    public bool DarkMode { get; set; } = true;
}

public class TenantSocialMedia
{
    public string? Instagram { get; set; }
    public string? Facebook { get; set; }
    public string? Twitter { get; set; }
    public string? Whatsapp { get; set; }
}

public class Tenant
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? CargoCompany { get; set; }
    public string? CargoCode { get; set; }
    public int WarrantyDays { get; set; } = 90;
    public string? Terms { get; set; }
    public string SubscriptionStatus { get; set; } = "active";
    public string SubscriptionPlan { get; set; } = "pro";
    public decimal? MonthlyFee { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Branding
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public string? CoverImageUrl { get; set; }

    // Theme
    public TenantTheme? Theme { get; set; }

    // Detail Info
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? WorkingHours { get; set; }
    public TenantSocialMedia? SocialMedia { get; set; }

    // Services
    public List<string> Services { get; set; } = new();
    public List<string> DeviceBrands { get; set; } = new();
}

public class StaffMember
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? TenantId { get; set; } = "tenant-default";
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Specialty { get; set; } = string.Empty;
    public int ActiveRepairs { get; set; } = 0;
    public string? Rating { get; set; } = "5.0/5";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
