using System;
using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("test-error")]
    public class TestErrorController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
            throw new Exception("This is a test error from your server", new Exception("Inner exception"));
        }
        [Route("aggregate")]
        public ActionResult Aggregate()
        {
            throw new AggregateException("This is a test aggregate exception", new[]
            {
                new Exception("another exception", new InvalidOperationException("Inner exception")), 
            });
        }
    }
}