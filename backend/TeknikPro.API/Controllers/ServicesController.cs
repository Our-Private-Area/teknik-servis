using Microsoft.AspNetCore.Mvc;
using TeknikPro.API.Models;
using TeknikPro.API.Services;

namespace TeknikPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ServiceRepository _repository;

    public ServicesController(ServiceRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public ActionResult<IEnumerable<ServiceRecord>> GetAll([FromQuery] string? status, [FromQuery] string? q)
    {
        var services = _repository.GetAll();

        if (!string.IsNullOrEmpty(status) && status != "all")
        {
            services = services.Where(s => s.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(q))
        {
            var query = q.ToLowerInvariant();
            services = services.Where(s =>
                s.TrackingNo.ToLowerInvariant().Contains(query) ||
                s.CustomerName.ToLowerInvariant().Contains(query) ||
                s.DeviceBrand.ToLowerInvariant().Contains(query) ||
                s.DeviceModel.ToLowerInvariant().Contains(query));
        }

        return Ok(services);
    }

    [HttpGet("{id}")]
    public ActionResult<ServiceRecord> GetById(string id)
    {
        var service = _repository.GetById(id);
        if (service == null) return NotFound(new { message = "Servis kaydı bulunamadı." });
        return Ok(service);
    }

    [HttpPost]
    public ActionResult<ServiceRecord> Create([FromBody] ServiceRecord record)
    {
        var created = _repository.Add(record);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] ServiceRecord updated)
    {
        if (!_repository.Update(id, updated))
            return NotFound(new { message = "Servis kaydı bulunamadı." });
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_repository.Delete(id))
            return NotFound(new { message = "Servis kaydı bulunamadı." });
        return NoContent();
    }
}
