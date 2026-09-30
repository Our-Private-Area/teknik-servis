using Microsoft.AspNetCore.Mvc;
using TeknikPro.API.Models;
using TeknikPro.API.Services;

namespace TeknikPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrackingController : ControllerBase
{
    private readonly ServiceRepository _repository;

    public TrackingController(ServiceRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("{trackingNo}")]
    public ActionResult<object> TrackDevice(string trackingNo)
    {
        var service = _repository.GetByTrackingNo(trackingNo);
        if (service == null)
        {
            return NotFound(new { message = $"'{trackingNo}' numaralı servis kaydı bulunamadı." });
        }

        // Public ekran için güvenli DTO çıktısı
        return Ok(new
        {
            service.TrackingNo,
            service.DeviceType,
            service.DeviceBrand,
            service.DeviceModel,
            service.SerialNo,
            service.Status,
            service.Priority,
            service.Complaint,
            service.Diagnosis,
            service.PerformedWork,
            service.PartsCost,
            service.LaborCost,
            service.TotalCost,
            service.PaidAmount,
            service.RemainingAmount,
            service.PaymentStatus,
            service.AccessoriesReceived,
            service.StatusHistory,
            service.ReceivedDate,
            service.EstimatedDeliveryDate,
            service.CompletedDate,
            service.DeliveredDate
        });
    }
}
