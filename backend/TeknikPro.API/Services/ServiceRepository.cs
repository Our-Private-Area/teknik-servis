using System.Collections.Concurrent;
using TeknikPro.API.Models;

namespace TeknikPro.API.Services;

public class ServiceRepository
{
    private readonly ConcurrentDictionary<string, ServiceRecord> _services = new();

    public ServiceRepository()
    {
        // Örnek başlangıç verileri
        SeedInitialData();
    }

    public IEnumerable<ServiceRecord> GetAll() => _services.Values.OrderByDescending(s => s.CreatedAt);

    public ServiceRecord? GetById(string id) =>
        _services.TryGetValue(id, out var service) ? service : null;

    public ServiceRecord? GetByTrackingNo(string trackingNo)
    {
        var clean = trackingNo.Trim().ToUpperInvariant();
        return _services.Values.FirstOrDefault(s =>
            s.TrackingNo.Equals(clean, StringComparison.OrdinalIgnoreCase) ||
            s.TrackingNo.Replace("-", "").Equals(clean.Replace("-", ""), StringComparison.OrdinalIgnoreCase));
    }

    public ServiceRecord Add(ServiceRecord record)
    {
        if (string.IsNullOrEmpty(record.Id))
            record.Id = $"srv-{Guid.NewGuid().ToString("N")[..8]}";

        if (string.IsNullOrEmpty(record.TrackingNo))
        {
            var rand = Random.Shared.Next(1000, 9999);
            record.TrackingNo = $"TK-2026-{rand}";
        }

        record.CreatedAt = DateTime.UtcNow;
        record.UpdatedAt = DateTime.UtcNow;

        if (record.StatusHistory.Count == 0)
        {
            record.StatusHistory.Add(new StatusHistoryItem
            {
                Status = record.Status,
                Note = "Servis kaydı açıldı.",
                UpdatedBy = "Sistem",
                Timestamp = DateTime.UtcNow
            });
        }

        _services[record.Id] = record;
        return record;
    }

    public bool Update(string id, ServiceRecord updated)
    {
        if (!_services.ContainsKey(id)) return false;
        updated.UpdatedAt = DateTime.UtcNow;
        _services[id] = updated;
        return true;
    }

    public bool Delete(string id) => _services.TryRemove(id, out _);

    private void SeedInitialData()
    {
        Add(new ServiceRecord
        {
            Id = "srv-101",
            TrackingNo = "TK-2026-8492",
            CustomerId = "cust-1",
            CustomerName = "Ahmet Yılmaz",
            AssignedStaffName = "Murat Usta",
            DeviceType = "Telefon",
            DeviceBrand = "Apple",
            DeviceModel = "iPhone 15 Pro Max",
            Complaint = "Cihaz yere düştü, ekran kırıldı ve dokunmatik algılamıyor.",
            Diagnosis = "OLED ekran modülü hasarlı, iç flex kabloda zedelenme tespit edildi.",
            PerformedWork = "Orijinal ekran montajı ve TrueTone kalibrasyonu yapıldı.",
            Status = "in_repair",
            Priority = "urgent",
            EstimatedCost = 7500,
            LaborCost = 1500,
            PartsCost = 6000,
            TotalCost = 7500,
            PaidAmount = 2000,
            RemainingAmount = 5500,
            PaymentStatus = "partial",
            AccessoriesReceived = new() { "Orijinal Kutu", "Kılıf" },
            PhysicalCondition = "Köşelerde hafif darbe izleri."
        });

        Add(new ServiceRecord
        {
            Id = "srv-102",
            TrackingNo = "TK-2026-3105",
            CustomerId = "cust-2",
            CustomerName = "Fatma Demir",
            AssignedStaffName = "Can Teknisyen",
            DeviceType = "Telefon",
            DeviceBrand = "Samsung",
            DeviceModel = "Galaxy S24 Ultra",
            Complaint = "Şarj soketi temassızlık yapıyor, hızlı şarj almıyor.",
            Diagnosis = "USB-C soket bordunda sıvı teması ve korozyon tespit edildi.",
            PerformedWork = "Orijinal alt şarj bordu yenilendi, test tamamlandı.",
            Status = "ready",
            Priority = "normal",
            EstimatedCost = 1850,
            LaborCost = 650,
            PartsCost = 1200,
            TotalCost = 1850,
            PaidAmount = 1000,
            RemainingAmount = 850,
            PaymentStatus = "partial",
            AccessoriesReceived = new() { "Sadece Cihaz" },
            PhysicalCondition = "Temiz."
        });
    }
}
